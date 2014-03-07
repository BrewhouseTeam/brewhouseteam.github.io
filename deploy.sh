#!/bin/sh

bundle exec jekyll build
git add --all
git ci -m "auto deploy"
git push origin master
