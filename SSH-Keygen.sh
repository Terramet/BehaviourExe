#!/bin/bash

gnome-terminal -e "ssh-keygen -f $1 -t rsa -N ''"

gnome-terminal -e "ssh-copy-id -i $1.pub $2"
