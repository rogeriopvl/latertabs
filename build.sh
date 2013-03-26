#!/bin/bash
mkdir build
zip -r build/latertabs-$1.zip manifest.json options.html popup.html js/ imgs/ fonts/ css/ LICENSE -x .DS_Store .gitignore \*/.DS_Store
