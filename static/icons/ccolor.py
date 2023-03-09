import sys
import glob

if (sys.argc != 3):
     print("usage: py color.py root_dir color")

root_dir = sys.argv[1]
color = sys.argv[2]

# root_dir needs a trailing slash (i.e. /root/dir/)
for filename in glob.iglob(root_dir + '**/*.svg', recursive=True):
     with open(filenam)