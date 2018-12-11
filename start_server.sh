#!/usr/bin/env bash
sudo forever start -l $PWD/server.log ./bin/www -c "sudo node"
