export default function itemList() {
  return {
    items: [],
    newName: '',
    editingId: null,
    editName: '',
    errorMessage: '',

    async init() {
      await this.fetchItems();
    },

    async fetchItems() {
      try {
        const res = await fetch('/api/items');
        if (!res.ok) throw new Error(await res.text());
        this.items = await res.json();
        this.errorMessage = '';
      } catch (err) {
        this.errorMessage = err.message;
      }
    },

    async create() {
      try {
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: this.newName }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create item');
        }
        this.newName = '';
        this.errorMessage = '';
        await this.fetchItems();
      } catch (err) {
        this.errorMessage = err.message;
      }
    },

    startEdit(item) {
      this.editingId = item.id;
      this.editName = item.name;
    },

    cancelEdit() {
      this.editingId = null;
      this.editName = '';
    },

    async update(id) {
      try {
        const res = await fetch(`/api/items/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: this.editName }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update item');
        }
        this.editingId = null;
        this.errorMessage = '';
        await this.fetchItems();
      } catch (err) {
        this.errorMessage = err.message;
      }
    },

    async remove(id) {
      try {
        const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          let message = 'Failed to delete item';
          try {
            const data = await res.json();
            message = data.error || message;
          } catch (_) { /* non-JSON body, use default */ }
          throw new Error(message);
        }
        this.errorMessage = '';
        await this.fetchItems();
      } catch (err) {
        this.errorMessage = err.message;
      }
    },
  };
}
