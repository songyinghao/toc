#!/usr/bin/env bash
DOCKER_VERSION=1.8.3-0~trusty

if ! dpkg -s docker-engine | grep -q Version.*$DOCKER_VERSION; then
  sudo apt-key adv --keyserver hkp://pgp.mit.edu:80 \
    --recv-keys 58118E89F3A912897C070ADBF76221572C52609D

  echo deb https://apt.dockerproject.org/repo ubuntu-trusty main \
    | sudo tee /etc/apt/sources.list.d/docker.list

  sudo apt-get update \
    && sudo apt-get install -y \
      curl \
      docker-engine=$DOCKER_VERSION \
    && sudo apt-get clean \
    && sudo rm -rf /tmp/* /var/tmp/*
fi

apt-cache policy docker-engine
