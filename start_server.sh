#!/usr/bin/env bash
sudo forever start -a -l $PWD/server.log ./bin/www -c "sudo node"
