#!/bin/sh

bundle exec jekyll build
cp -r _site/* ~/Dropbox/harp.io/apps/brewhouse.harp.io/public/
