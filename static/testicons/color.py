import sys
import os
import re

if (len(sys.argv) != 4):
     print("usage: py color.py root_dir prefix color")
     sys.exit(1)

root_dir = sys.argv[1]
prefix = sys.argv[2]
color = sys.argv[3]

for path, currentDirectory, files in os.walk(root_dir):
     for file in files:
          if file.split('.')[1] == 'svg' and prefix == file.split('-')[0]:
               content = ""
               with open(os.path.join(path, file), "r") as f:
                    content = f.read()
                    content = re.sub(r"fill=\".*?\"", f"fill=\"#{color}\"", content)
               print(content)
               # with open(os.path.join(path, file), "w") as f:
                    # f.write(content)

