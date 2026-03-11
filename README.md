# PopMe

PopMe is a playful to‑do app where tasks live as floating bubbles instead of a list. Priority controls bubble size, energy controls bubble color, and tasks gently hover to feel alive. There’s a soft “add task” bubble at the bottom, an edit modal with live preview, and recent tasks you can restore later.

## What it does

- Create tasks from a bottom “add task” bubble  
- Tasks appear as floating bubbles on the home screen  
- Size = priority, color = energy  
- Tap to select, double‑tap to edit  
- Edit modal with live preview, sliders, due date, and subtasks  
- Long‑press a bubble to pop/delete it (with sound + haptic)  
- Recent Tasks screen to restore deleted items  

## Requirements

- Node.js 18+ recommended  
- Expo CLI (installed automatically via `npx expo`)  

## Install

```bash
npm install
expo install expo-linear-gradient expo-blur expo-av @react-native-community/slider @react-native-community/datetimepicker
```

## Run

```bash
npm start
```
