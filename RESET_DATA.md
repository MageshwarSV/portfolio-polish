# Reset Portfolio Data

If the portfolio is not showing data correctly, follow these steps:

## Option 1: Clear Browser Storage (Recommended)

1. Open your browser's Developer Tools (Press F12)
2. Go to the "Console" tab
3. Paste this command and press Enter:

```javascript
localStorage.clear(); location.reload();
```

This will clear all saved data and reload with fresh default data.

## Option 2: Using Admin Panel

1. Go to `/admin/dashboard`
2. Click the "Delete All Data" button at the bottom
3. Refresh the page

## Why This Happens

The admin panel saved data to localStorage without icon components, which caused rendering issues. The fixes now handle this properly, but existing localStorage data needs to be cleared once.

## After Reset

After clearing localStorage:
- All experience, projects, and skills will be reset to defaults
- You can add/edit data again through the admin panel
- The new changes will save icons properly
