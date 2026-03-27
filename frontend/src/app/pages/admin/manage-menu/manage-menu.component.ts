import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MenuService } from '../../../core/services/menu.service';
import { ToastService } from '../../../core/services/toast.service';
import { MenuItem } from '../../../models';

@Component({
  selector: 'app-manage-menu',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Menu Items</h1>
          <p class="text-gray-500 text-sm mt-0.5">{{ menuItems().length }} items in menu</p>
        </div>
        <button (click)="openModal()" class="btn-primary flex items-center gap-2">
          <span class="text-lg">+</span> Add Item
        </button>
      </div>

      <!-- Menu Table -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        @if (loading()) {
          <div class="p-10 flex justify-center">
            <div class="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th class="px-4 py-3 text-left">Item</th>
                  <th class="px-4 py-3 text-left">Category</th>
                  <th class="px-4 py-3 text-left">Price</th>
                  <th class="px-4 py-3 text-left">Status</th>
                  <th class="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (item of menuItems(); track item._id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <img [src]="item.image" [alt]="item.name"
                          class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'">
                        <div>
                          <p class="font-medium text-gray-800">{{ item.name }}</p>
                          <p class="text-gray-400 text-xs line-clamp-1 max-w-xs">{{ item.description }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="bg-orange-50 text-orange-600 text-xs font-medium px-2 py-1 rounded-full">
                        {{ item.category }}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-semibold text-gray-800">Rs. {{ item.price }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                        [class]="item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                        <span class="w-1.5 h-1.5 rounded-full"
                          [class]="item.isAvailable ? 'bg-green-500' : 'bg-red-500'"></span>
                        {{ item.isAvailable ? 'Available' : 'Unavailable' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <button (click)="openModal(item)"
                          class="text-blue-500 hover:text-blue-700 text-xs font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                          Edit
                        </button>
                        <button (click)="deleteItem(item)"
                          class="text-red-400 hover:text-red-600 text-xs font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (menuItems().length === 0) {
            <div class="text-center py-12 text-gray-400">
              <div class="text-4xl mb-2">🍛</div>
              <p>No menu items yet. Add one!</p>
            </div>
          }
        }
      </div>
    </div>

    <!-- ===== ADD / EDIT MODAL ===== -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center px-4"
        (click)="closeModal()">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
          (click)="$event.stopPropagation()">

          <!-- Modal header -->
          <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
            <h2 class="font-bold text-gray-800 text-lg">
              {{ editingItem() ? 'Edit Item' : 'Add New Item' }}
            </h2>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>

          <form [formGroup]="menuForm" (ngSubmit)="saveItem()" class="p-6 space-y-4">

            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input type="text" formControlName="name" placeholder="e.g. Butter Chicken"
                class="input-field" [class.input-error]="mf['name'].touched && mf['name'].invalid">
              @if (mf['name'].touched && mf['name'].invalid) {
                <p class="text-red-500 text-xs mt-1">Item name is required.</p>
              }
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea formControlName="description" rows="2"
                placeholder="Describe this dish..."
                class="input-field resize-none"
                [class.input-error]="mf['description'].touched && mf['description'].invalid">
              </textarea>
              @if (mf['description'].touched && mf['description'].invalid) {
                <p class="text-red-500 text-xs mt-1">Description is required.</p>
              }
            </div>

            <!-- Price + Category -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
                <input type="number" formControlName="price" placeholder="0"
                  class="input-field" [class.input-error]="mf['price'].touched && mf['price'].invalid" min="0">
                @if (mf['price'].touched && mf['price'].invalid) {
                  <p class="text-red-500 text-xs mt-1">Valid price required.</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select formControlName="category" class="input-field">
                  <option value="">Select category</option>
                  @for (cat of categories; track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </select>
                @if (mf['category'].touched && mf['category'].invalid) {
                  <p class="text-red-500 text-xs mt-1">Category is required.</p>
                }
              </div>
            </div>

            <!-- ===== IMAGE SECTION — Upload OR URL ===== -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Item Image</label>

              <!-- Toggle buttons -->
              <div class="flex gap-2 mb-3">
                <button type="button"
                  (click)="imageMode.set('url')"
                  class="flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all"
                  [class]="imageMode() === 'url'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'">
                  🔗 Image URL
                </button>
                <button type="button"
                  (click)="imageMode.set('upload')"
                  class="flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all"
                  [class]="imageMode() === 'upload'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'">
                  📁 Upload File
                </button>
              </div>

              <!-- URL input -->
              @if (imageMode() === 'url') {
                <input type="text" formControlName="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  class="input-field text-sm">
                <p class="text-gray-400 text-xs mt-1">Paste a direct image URL (jpg, png, webp)</p>

                <!-- URL preview -->
                @if (mf['imageUrl'].value && mf['imageUrl'].value.trim()) {
                  <div class="mt-3">
                    <p class="text-xs text-gray-500 mb-1">Preview:</p>
                    <img [src]="mf['imageUrl'].value"
                      alt="Preview"
                      class="w-full h-36 object-cover rounded-xl border border-gray-200"
                      onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                    >
                    <div class="hidden w-full h-36 rounded-xl border border-dashed border-red-300 bg-red-50 items-center justify-center">
                      <p class="text-red-400 text-xs">Invalid image URL</p>
                    </div>
                  </div>
                }
              }

              <!-- File upload input -->
              @if (imageMode() === 'upload') {
                <div class="relative">
                  <input type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    (change)="onFileSelected($event)"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    #fileInput>
                  <div class="border-2 border-dashed rounded-xl p-6 text-center transition-colors"
                    [class]="selectedFile() ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300'">
                    @if (selectedFile()) {
                      <p class="text-orange-600 text-sm font-medium">📎 {{ selectedFile()!.name }}</p>
                      <p class="text-gray-400 text-xs mt-1">{{ getFileSizeKB() }} KB</p>
                    } @else {
                      <p class="text-gray-500 text-sm">Click to browse or drag & drop</p>
                      <p class="text-gray-400 text-xs mt-1">JPG, PNG, WEBP — max 5MB</p>
                    }
                  </div>
                </div>

                <!-- File preview -->
                @if (filePreviewUrl()) {
                  <div class="mt-3">
                    <p class="text-xs text-gray-500 mb-1">Preview:</p>
                    <img [src]="filePreviewUrl()!"
                      alt="Preview"
                      class="w-full h-36 object-cover rounded-xl border border-gray-200">
                  </div>
                }

                <!-- Show existing image when editing -->
                @if (editingItem() && !selectedFile()) {
                  <div class="mt-3">
                    <p class="text-xs text-gray-500 mb-1">Current image (will be kept if no new file selected):</p>
                    <img [src]="editingItem()!.image"
                      alt="Current"
                      class="w-full h-36 object-cover rounded-xl border border-gray-200 opacity-70"
                      onerror="this.style.display='none'">
                  </div>
                }
              }
            </div>

            <!-- Available toggle -->
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-700">Available for Order</p>
                <p class="text-xs text-gray-400">Toggle item availability</p>
              </div>
              <button type="button"
                (click)="menuForm.patchValue({ isAvailable: !mf['isAvailable'].value })"
                class="relative w-11 h-6 rounded-full transition-colors focus:outline-none"
                [class]="mf['isAvailable'].value ? 'bg-orange-500' : 'bg-gray-300'">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  [class]="mf['isAvailable'].value ? 'translate-x-5' : 'translate-x-0'"></span>
              </button>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button type="button" (click)="closeModal()" class="btn-secondary flex-1">Cancel</button>
              <button type="submit" [disabled]="saving()" class="btn-primary flex-1">
                @if (saving()) { Saving... }
                @else { {{ editingItem() ? 'Update Item' : 'Add Item' }} }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ManageMenuComponent implements OnInit {
  menuService = inject(MenuService);
  toast       = inject(ToastService);
  fb          = inject(FormBuilder);

  menuItems    = signal<MenuItem[]>([]);
  loading      = signal(true);
  showModal    = signal(false);
  editingItem  = signal<MenuItem | null>(null);
  saving       = signal(false);
  imageMode    = signal<'url' | 'upload'>('url');
  selectedFile = signal<File | null>(null);
  filePreviewUrl = signal<string | null>(null);

  categories = ['Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Desserts', 'Beverages', 'Snacks'];

  menuForm = this.fb.group({
    name:        ['', Validators.required],
    description: ['', Validators.required],
    price:       [0, [Validators.required, Validators.min(0)]],
    category:    ['', Validators.required],
    imageUrl:    [''],
    isAvailable: [true]
  });

  get mf() { return this.menuForm.controls; }

  ngOnInit(): void { this.loadMenu(); }

  loadMenu(): void {
    this.menuService.getMenuItems().subscribe({
      next: (res) => { this.menuItems.set(res.items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openModal(item?: MenuItem): void {
    // Reset file state
    this.selectedFile.set(null);
    this.filePreviewUrl.set(null);

    if (item) {
      this.editingItem.set(item);
      // Decide default tab: if image is a URL (starts with http), show URL tab
      const isUrl = item.image && (item.image.startsWith('http') || item.image.startsWith('https'));
      this.imageMode.set(isUrl ? 'url' : 'upload');
      this.menuForm.patchValue({
        name:        item.name,
        description: item.description,
        price:       item.price,
        category:    item.category,
        imageUrl:    isUrl ? item.image : '',
        isAvailable: item.isAvailable
      });
    } else {
      this.editingItem.set(null);
      this.imageMode.set('url');
      this.menuForm.reset({ isAvailable: true, price: 0 });
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingItem.set(null);
    this.selectedFile.set(null);
    this.filePreviewUrl.set(null);
    this.menuForm.reset({ isAvailable: true, price: 0 });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('File too large. Max size is 5MB.');
      return;
    }

    this.selectedFile.set(file);

    // Generate preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.filePreviewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  getFileSizeKB(): string {
    const file = this.selectedFile();
    return file ? (file.size / 1024).toFixed(1) : '0';
  }

  saveItem(): void {
    if (this.menuForm.invalid) { this.menuForm.markAllAsTouched(); return; }
    this.saving.set(true);

    const v = this.menuForm.value;

    // Build FormData — always send all text fields
    const formData = new FormData();
    formData.append('name',        v.name!);
    formData.append('description', v.description!);
    formData.append('price',       String(v.price!));
    formData.append('category',    v.category!);
    formData.append('isAvailable', String(v.isAvailable!));

    if (this.imageMode() === 'upload' && this.selectedFile()) {
      // Attach actual file — multer will handle it on backend
      formData.append('image', this.selectedFile()!);
    } else if (this.imageMode() === 'url' && v.imageUrl && v.imageUrl.trim()) {
      // Send URL as a regular body field
      formData.append('imageUrl', v.imageUrl.trim());
    }

    const obs = this.editingItem()
      ? this.menuService.updateMenuItem(this.editingItem()!._id, formData)
      : this.menuService.createMenuItem(formData);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.editingItem() ? 'Item updated!' : 'Item added!');
        this.loadMenu();
        this.closeModal();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err.error?.message || 'Operation failed.');
      }
    });
  }

  deleteItem(item: MenuItem): void {
    if (!confirm('Delete "' + item.name + '"? This cannot be undone.')) return;
    this.menuService.deleteMenuItem(item._id).subscribe({
      next: () => {
        this.menuItems.update(items => items.filter(i => i._id !== item._id));
        this.toast.success('Item deleted!');
      },
      error: (err) => this.toast.error(err.error?.message || 'Delete failed.')
    });
  }
}