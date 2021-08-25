import rospy
from std_msgs.msg import String
from sensor_msgs.msg import Image,CompressedImage
from geometry_msgs.msg import Twist

import miro_msgs
from miro_msgs.msg import platform_config,platform_sensors,platform_state,platform_mics,platform_control,core_state,core_control,core_config,bridge_config,bridge_stream
import json
import math
import numpy
import time
import sys
from miro_constants import miro

def error(msg):
	print(msg)
	sys.exit(0)

def usage():
	print """
Usage:
	miromove.py robot=<robot_name>

	Without arguments, this help page is displayed. To run the
	client you must specify at least the option "robot".

Options:
	robot=<robot_name>
		specify the name of the miro robot to connect to,
		which forms the ros base topic "/miro/<robot_name>".
		there is no default, this argument must be specified.
	"""
	sys.exit(0)

class miro_ros_client:

	def callback_platform_sensors(self, object):

		# ignore until active
		if not self.active:
			return

		# store object
		self.platform_sensors = object

		# send downstream command, ignoring upstream data
		q = platform_control()

		# timing
		sync_rate = 50
		period = 2 * sync_rate # two seconds per period
		z = self.count / period

		self.body_vel = None
		self.body_vel = Twist()

		with open("/home/dualbootlt/Desktop/BehaviourExe/public/robot_resources/movement.json") as json_file:
			data = json.load(json_file)
			self.body_vel.linear.x = float(data['x'])
			self.body_vel.angular.z = float(data['y'])

		q.body_vel = self.body_vel
		self.pub_platform_control.publish(q)
		print("Hi")
		# count
		self.count = self.count + 1
		if self.count == 400:
			self.count = 0

	def loop(self):
		while True:
			# ignore until active
			if not self.active:
				return

			# store object
			self.platform_sensors = object

			# send downstream command, ignoring upstream data
			q = platform_control()

			# timing
			sync_rate = 50
			period = 2 * sync_rate # two seconds per period
			z = self.count / period

			self.body_vel = None
			self.body_vel = Twist()

			with open("/home/dualbootlt/Desktop/BehaviourExe/public/robot_resources/movement.json") as json_file:
				data = json.load(json_file)
				self.body_vel.linear.x = float(data['x'])
				self.body_vel.angular.z = float(data['y'])

			q.body_vel = self.body_vel
			self.pub_platform_control.publish(q)
			print("Hi")
			# count
			self.count = self.count + 1
			if self.count == 400:
				self.count = 0
			if rospy.core.is_shutdown():
				break
			time.sleep(0.1)

	def __init__(self):

		# report
		print("initialising...")
		print(sys.version)

		# default data
		self.platform_sensors = None
		self.platform_state = None
		self.platform_mics = None
		self.core_state = None

		# no arguments gives usage
		if len(sys.argv) == 1:
			usage()

		# options
		self.robot_name = ""
		self.drive_pattern = ""

		# handle args
		for arg in sys.argv[1:]:
			f = arg.find('=')
			if f == -1:
				key = arg
				val = ""
			else:
				key = arg[:f]
				val = arg[f+1:]
			if key == "robot":
				self.robot_name = val
			elif key == "drive":
				self.drive_pattern = val
			else:
				error("argument not recognised \"" + arg + "\"")

		# check we got at least one
		if len(self.robot_name) == 0:
			error("argument \"robot\" must be specified")

		# pattern
		self.count = 0
		self.z_bak = -1


		# set inactive
		self.active = False

		# topic root
		topic_root = "/miro/" + self.robot_name
		print "topic_root", topic_root

		# publish
		self.pub_platform_control = rospy.Publisher(topic_root + "/platform/control",
					platform_control, queue_size=0)
		self.pub_core_control = rospy.Publisher(topic_root + "/core/control",
					core_control, queue_size=0)
		self.pub_bridge_config = rospy.Publisher(topic_root + "/bridge/config",
					bridge_config, queue_size=0)
		self.pub_bridge_stream = rospy.Publisher(topic_root + "/bridge/stream",
					bridge_stream, queue_size=0)
		self.pub_platform_config = rospy.Publisher(topic_root + "/platform/config",
					platform_config, queue_size=0)

		# subscribe
		self.sub_sensors = rospy.Subscriber(topic_root + "/platform/sensors",
				platform_sensors, self.callback_platform_sensors)

		# set active
		self.active = True

if __name__ == "__main__":
	print("Hi")
	rospy.init_node("miromove_py", anonymous=True)
	main = miro_ros_client()
	main.loop()
#-----------------------------END MOVE_FORWARD---------------------------------
