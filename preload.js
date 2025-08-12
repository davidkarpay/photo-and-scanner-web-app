const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    savePhoto: (photoData, filename) => {
        return ipcRenderer.invoke('save-photo', photoData, filename);
    }
});