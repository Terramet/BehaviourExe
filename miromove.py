#-----------------------------START SETUP_MIRO---------------------------------
import rospy
import miro_msgs
from miro_msgs.msg import platform_control
from miro_constants import miro
from geometry_msgs.msg import Twist
from sensor_msgs.msg import Range, Image
from std_msgs.msg import Float32MultiArray
import sys
import subprocess
import rosnode
import numpy as np
import cv2
import time
import os
import math
import rospkg

rospy.init_node('BEMove')

robot_name = None
vel_x = None
vel_y = None

for arg in sys.argv[1:]:
	f = arg.find('=')
	if f == -1:
		key = arg
		val = ""
	else:
		key = arg[:f]
		val = arg[f+1:]
	if key == "robot":
		robot_name = val
	elif key == "x":
		vel_x = float(val)
	elif key == "y":
		vel_y = float(val)
	else:
		error("argument not recognised \"" + arg + "\"")

pub = rospy.Publisher('/miro/' + robot_name + '/platform/control',
    platform_control, queue_size=10)
rate = rospy.Rate(10)
q = platform_control()
#-----------------------------END SETUP_MIRO---------------------------------

#-----------------------------START MOVE_FORWARD---------------------------------
body_vel = Twist()
body_vel.angular.z = vel_y
body_vel.linear.x = vel_x
q.body_vel = body_vel

#ensures that at least one node is connected before sending message
while(pub.get_num_connections() == 0):
    rate.sleep()
pub.publish(q)
q.body_vel = body_vel
pub.publish(q)	#Allow time for the move to be executed
#-----------------------------END MOVE_FORWARD---------------------------------
