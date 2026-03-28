import os, re

color_map = {
    r'bg-\[\#1a0000\]': '',
    r'bg-\[\#0a0000\]': 'bg-background',
    r'border-\[\#460000\]': 'border-border',
    r'text-\[\#f2e6e6\]': 'text-foreground',
    r'text-\[\#c58a8a\]': 'text-foreground-muted',
    r'text-\[\#993333\]': 'text-primary-hot',
    r'bg-\[\#993333\]': 'bg-primary text-primary-foreground',
    r'border-\[\#993333\]': 'border-primary',
    r'hover:bg-\[\#800000\]': 'hover:bg-primary/80',
    r'text-\[\#10b981\]': 'text-success',
    r'bg-\[\#10b981\]': 'bg-success',
    r'text-\[\#f59e0b\]': 'text-warning',
    r'bg-\[\#f59e0b\]': 'bg-warning',
    r'text-\[\#ef4444\]': 'text-destructive',
    r'bg-\[\#ef4444\]': 'bg-destructive'
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in color_map.items():
        new_content = re.sub(pattern, replacement, new_content, flags=re.IGNORECASE)
        
    new_content = re.sub(r' +', ' ', new_content)
    new_content = new_content.replace(' className=\" \"', '')
    new_content = new_content.replace('\" ', '\"')
    new_content = new_content.replace(' className=\"', ' className=\"')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')

src_dir = 'src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            process_file(os.path.join(root, file))
