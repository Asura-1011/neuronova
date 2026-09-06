/**
 * MemoryManager Component (Caregiver side)
 * Allows adding and managing family memory cards
 */

const MemoryManager = {
  render(container) {
    const memories = AdaptiveEngine.getFamilyMemories();

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div style="background:var(--bg-card); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <h3 style="margin-bottom:12px;">Add New Family Member 👨‍👩‍👧‍👦</h3>
          <form onsubmit="MemoryManager.handleAdd(event)" style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <input type="text" id="mem-name" placeholder="Name (e.g. Fathima)" class="form-input" required />
              <select id="mem-relation" class="form-input" required>
                <option value="Daughter">Daughter</option>
                <option value="Son">Son</option>
                <option value="Spouse">Spouse</option>
                <option value="Grandchild">Grandchild</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Friend">Friend</option>
              </select>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <input type="text" id="mem-image" placeholder="Image URL or Emoji (e.g. 👩‍⚕️)" class="form-input" required />
              <input type="text" id="mem-desc" placeholder="Brief note / memory context" class="form-input" />
            </div>
            <button type="submit" class="btn btn-primary" style="align-self:flex-start;">+ Add Family Member</button>
          </form>
        </div>

        <h3 style="margin-top:8px;">Current Family Tree Members</h3>
        <div class="family-tree-grid">
          ${memories.map(m => `
            <div class="family-card" style="cursor:default;">
              <div class="family-avatar">
                ${m.image.startsWith('http') || m.image.startsWith('data:') 
                  ? `<img src="${m.image}" alt="${m.name}" />`
                  : `<span>${m.image}</span>`}
              </div>
              <div class="family-info">
                <div class="family-name">${m.name}</div>
                <div class="family-relation">${m.relation}</div>
                <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">"${m.description}"</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  handleAdd(event) {
    event.preventDefault();
    const name = document.getElementById('mem-name').value;
    const relation = document.getElementById('mem-relation').value;
    const image = document.getElementById('mem-image').value;
    const desc = document.getElementById('mem-desc').value;

    AdaptiveEngine.addFamilyMemory(name, relation, image, desc);
    alert(`Added ${name} (${relation}) to family tree!`);
    this.render(document.getElementById('caregiver-tab-content'));
  }
};
