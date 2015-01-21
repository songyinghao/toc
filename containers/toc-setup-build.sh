#!/usr/bin/env bash
TOC_VER="$(git describe --tags --abbrev=0)"

if [ ! -f $TOC_DIR/containers/build/.packages/android-sdk_r24.0.2-linux.tgz ];
  then
  curl https://dl.dropboxusercontent.com/u/172349/android-sdk_r24.0.2-linux.tgz \
  --create-dirs \
  -o $TOC_DIR/containers/build/.packages/android-sdk_r24.0.2-linux.tgz
fi

sudo docker build -t toc-build:$TOC_VER $TOC_DIR/containers/build
sudo docker build -t toc-build:latest $TOC_DIR/containers/build