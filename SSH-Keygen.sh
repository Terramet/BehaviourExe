#!/bin/bash

ssh-keygen -f $1 -t rsa -N ''

ssh-copy-id -i $1.pub $2
