#!/bin/sh

set -e # stop on error

# git checkout source
# git add --all
# git ci -m "auto deploy"

# bundle exec jekyll build

# git branch -D master
# git checkout -b master

# git filter-branch --subdirectory-filter _site/ -f
# git checkout source

# git push --all origin

echo "If you're running the jekyll serve command the deploy will not work correctly!\n"
read -rsp $'Press any key to continue or control-c to cancel...\n';

git checkout source
bundle exec jekyll build
git add .
git commit -a -m "auto deploy :boom:"
git push origin source

rm -rf /tmp/_site
cp -r _site /tmp/_site
git checkout master
cp -r /tmp/_site/* .
git add .
git commit -a -m "auto deploy :boom:"
git push -f origin master
git checkout source
