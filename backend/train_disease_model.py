import os
import sys
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder
import torch.nn.functional as F

from pytorch_model import CNN_NeuralNet

# Set paths
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "plant_dataset"))
TRAIN_DIR = os.path.join(DATA_DIR, "train")
VALID_DIR = os.path.join(DATA_DIR, "valid")
MODEL_OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "plant_disease_model.pth")
CLASSES_OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "disease_classes.json")

print(f"Dataset directory: {DATA_DIR}")
if not os.path.exists(TRAIN_DIR):
    print("Dataset not fully unzipped yet or path incorrect.")
    # In a real scenario, we might sys.exit(1), but let's just warn for now

# Transforms
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor()
])

if __name__ == "__main__":
    try:
        train = ImageFolder(TRAIN_DIR, transform=transform)
        valid = ImageFolder(VALID_DIR, transform=transform)
        
        classes = train.classes
        print(f"Found {len(classes)} classes with {len(train)} total training images and {len(valid)} validation images.", flush=True)

        # Save classes
        with open(CLASSES_OUT_PATH, "w") as f:
            json.dump({"classes": classes, "treatments": {}, "mode": "pytorch"}, f)

        # Optimization for GTX 1650 (4GB VRAM)
        batch_size = 8 
        train_dataloader = DataLoader(train, batch_size, shuffle=True, num_workers=2, pin_memory=True)
        valid_dataloader = DataLoader(valid, batch_size, num_workers=2, pin_memory=True)

        def get_default_device():
            if torch.cuda.is_available():
                print("CUDA is available! Training on GPU.")
                return torch.device("cuda")
            else:
                print("CUDA not found. Training on CPU.")
                return torch.device("cpu")

        device = get_default_device()
        print(f"Using device: {device}")

        def to_device(data, device):
            if isinstance(data, (list,tuple)):
                return [to_device(x, device) for x in data]
            return data.to(device, non_blocking=True)

        class DeviceDataLoader():
            def __init__(self, dataloader, device):
                self.dataloader = dataloader
                self.device = device
                
            def __iter__(self):
                for b in self.dataloader:
                    yield to_device(b, self.device)
                
            def __len__(self):
                return len(self.dataloader)

        train_dataloader = DeviceDataLoader(train_dataloader, device)
        valid_dataloader = DeviceDataLoader(valid_dataloader, device)

        def accuracy(outputs, labels):
            _, preds = torch.max(outputs, dim=1)
            return torch.tensor(torch.sum(preds == labels).item() / len(preds))

        def evaluate(model, val_loader):
            model.eval()
            outputs = []
            with torch.no_grad():
                for batch in val_loader:
                    images, labels = batch
                    out = model(images)
                    loss = F.cross_entropy(out, labels)
                    acc = accuracy(out, labels)
                    outputs.append({'val_loss': loss.detach(), 'val_acc': acc})
            
            batch_losses = [x['val_loss'] for x in outputs]
            epoch_loss = torch.stack(batch_losses).mean()
            batch_accs = [x['val_acc'] for x in outputs]
            epoch_acc = torch.stack(batch_accs).mean()
            return {'val_loss': epoch_loss.item(), 'val_acc': epoch_acc.item()}

        def get_lr(optimizer):
            for param_group in optimizer.param_groups:
                return param_group['lr']

        model = CNN_NeuralNet(3, len(classes))
        model = to_device(model, device)

        epochs = 1
        max_lr = 0.001 # Reduced slightly for better stability
        grad_clip = 0.1
        weight_decay = 1e-4

        torch.cuda.empty_cache()
        optimizer = torch.optim.Adam(model.parameters(), max_lr, weight_decay=weight_decay)
        sched = torch.optim.lr_scheduler.OneCycleLR(optimizer, max_lr, epochs=epochs, steps_per_epoch=len(train_dataloader))

        print("Starting training...")
        for epoch in range(epochs):
            model.train()
            train_losses = []
            for i, batch in enumerate(train_dataloader):
                images, labels = batch
                out = model(images)
                loss = F.cross_entropy(out, labels)
                
                train_losses.append(loss)
                loss.backward()
                
                if grad_clip: 
                    nn.utils.clip_grad_value_(model.parameters(), grad_clip)
                    
                optimizer.step()
                optimizer.zero_grad()
                
                sched.step()
                
                if i % 100 == 0:
                    print(f"Epoch [{epoch}], Step [{i}/{len(train_dataloader)}], Loss: {loss.item():.4f}")
                
            result = evaluate(model, valid_dataloader)
            result['train_loss'] = torch.stack(train_losses).mean().item()
            print("Epoch [{}], train_loss: {:.4f}, val_loss: {:.4f}, val_acc: {:.4f}".format(
                epoch, result['train_loss'], result['val_loss'], result['val_acc']))

        # Save model
        print("Saving model...")
        torch.save(model.state_dict(), MODEL_OUT_PATH)
        print(f"Model saved to {MODEL_OUT_PATH}")

    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

    except FileNotFoundError:
        print("Dataset directories not found. Make sure unzip is complete.")

