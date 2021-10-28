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

if __name__ == "__main__":
	rospy.init_node("bark_py", anonymous=True)
	topic_root = "/miro/rob01"
	pub_bridge_stream = rospy.Publisher(topic_root + "/bridge/stream",
				bridge_stream, queue_size=0)

	while pub_bridge_stream.get_num_connections() < 1:
		time.sleep(0.1)

	b = bridge_stream()
	b.sound_index_P3 = 6
	pub_bridge_stream.publish(b)
