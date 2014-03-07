#!/bin/sh

git checkout source
git add --all
git ci -m "auto deploy"

bundle exec jekyll build

git branch -D master
git checkout -b master

git filter-branch --subdirectory-filter _site/ -f
git checkout source

git push --all origin
