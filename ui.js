:root {
    --color-from: #134e4a;
    --color-via: #164e63;
    --color-to: #064e3b;
    --color-accent: #5eead4;
    --color-accent-light: #a7f3d0;
    --color-accent-dark: #14b8a6;
}
body {
    font-family: 'Inter', sans-serif;
    background-image: linear-gradient(to bottom right, var(--color-from), var(--color-via), var(--color-to));
}
.glass-panel {
    background: rgba(255, 255, 255, 0.1);
    -webkit-backdrop-filter: blur(15px);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: background 0.3s ease;
}
.progress-ring__circle { 
    stroke: var(--color-accent); 
    transition: stroke-dashoffset 0.7s ease-in-out, stroke 0.5s ease; 
    transform: rotate(-90deg); 
    transform-origin: 50% 50%; 
}
.main-add-button { 
    background-color: var(--color-accent); 
    box-shadow: 0 4px 20px color-mix(in srgb, var(--color-accent) 40%, transparent); 
    transition: all 0.3s ease; 
}
.main-add-button:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 6px 25px color-mix(in srgb, var(--color-accent) 50%, transparent); 
}
.chart-bar-fill { 
    background-color: var(--color-accent); 
    transition: height 1s ease-in-out, background-color 0.5s ease; 
}
.animate-on-scroll { 
    opacity: 0; 
    transform: translateY(20px); 
    transition: opacity 0.6s ease-out, transform 0.6s ease-out; 
}
.animate-on-scroll.is-visible { 
    opacity: 1; 
    transform: translateY(0); 
}
.drag-handle { 
    display: none; 
    cursor: grab; 
    position: absolute; 
    top: 16px; 
    right: 16px; 
    opacity: 0.5; 
}
.reorder-mode .widget .drag-handle { display: block; }
.reorder-mode .widget { border: 2px dashed rgba(255,255,255,0.3); }
.sortable-ghost { opacity: 0.4; }
.sortable-chosen { border-style: solid; }
.switch { position: relative; display: inline-block; width: 50px; height: 28px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.2); transition: .4s; border-radius: 28px; }
.slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: var(--color-accent); }
input:checked + .slider:before { transform: translateX(22px); }
