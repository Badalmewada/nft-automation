import { useState, useEffect } from "react";

export default function useWalletGroups() {
  const [groups, setGroups] = useState([]);

  async function load() {
    const g = await window.api.walletGroups.list();
    setGroups(g);
  }

  async function create(data) {
    await window.api.walletGroups.create(data);
    await load();
  }

  async function remove(id) {
    await window.api.walletGroups.delete(id);
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return { groups, create, remove, reload: load };
}
