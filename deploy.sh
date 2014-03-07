#!/bin/sh

# git checkout source
# git add --all
# git ci -m "auto deploy"

# bundle exec jekyll build

# git branch -D master
# git checkout -b master

# git filter-branch --subdirectory-filter _site/ -f
# git checkout source

# git push --all origin

git co source
bundle exec jekyll build
git add .
git commit -a -m "auto deploy :boom:"

rm -rf /tmp/_site
cp -r _site /tmp/_site
git checkout master
cp -r /tmp/_site/* .
git add .
git commit -a -m "auto deploy :boom:"
git push origin master
git co source
