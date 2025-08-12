const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        resizable: false,
        autoHideMenuBar: true,
        title: 'Camera App'
    });

    mainWindow.loadFile('index.html');
}

ipcMain.handle('save-photo', async (event, photoData, filename) => {
    try {
        const buffer = Buffer.from(photoData);
        const filepath = path.join(__dirname, filename);
        
        fs.writeFileSync(filepath, buffer);
        
        console.log(`Photo saved: ${filepath}`);
        return { success: true, path: filepath };
    } catch (error) {
        console.error('Error saving photo:', error);
        throw error;
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});