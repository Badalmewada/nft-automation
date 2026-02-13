const db = require("../db/database");
const { v4: uuid } = require("uuid");

class WalletGroupService {

  async createGroup(data) {
    const group = {
      id: uuid(),
      name: data.name,
      description: data.description || "",
      color: data.color || "#3b82f6",
      createdAt: Date.now()
    };

    await db.walletGroups.create(group);
    return group;
  }

  async getGroups() {
    return await db.walletGroups.findAll();
  }

  async deleteGroup(id) {
    await db.walletGroups.delete(id);
    return true;
  }

 async updateGroup(id, updates) {
  if (!id) throw new Error("Group id required");

  const allowed = ["name", "color", "description", "icon"];
  const safe = {};

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      safe[key] = updates[key];
    }
  }

  await db.walletGroups.update(id, {
    ...safe,
    updatedAt: Date.now()
  });

  return db.walletGroups.findById(id); // 🔥 IMPORTANT
}

}

module.exports = new WalletGroupService();
