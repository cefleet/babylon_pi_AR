import cv2
from PIL import Image
from StringIO import StringIO
from flask import Flask,send_file, request, make_response, jsonify, send_from_directory
import threading
import numpy as np
import time
app = Flask(__name__, static_folder='static', static_url_path='')

capture = None
captureThread = None
image = None
#######Setting Up GPIO zero items

#the commented out parts reqiure gpiozero or will error out
motors = {
    "motor1" : {
        "isActive":False,
        "name":"motor1",
        #motor: Motor(forward=4,backward=14); forward is positive, backward is negative
        "endStop":{
            "positive":{
                #button:Button(2),#the button for the GPIO Pin
                "isHit":False
            },
            "negative":{
                #button:Button(2),#the button for the GPIO Pin
                "isHit":False
            }
        }
    },
    "motor2" : {
        "isActive":False,
        "name":"motor2",
        #motor: Motor(forward=4,backward=14); forward is positive, backward is negative
        "endStop":{
            "positive":{
                #button:Button(2),#the button for the GPIO Pin
                "isHit":False
            },
            "negative":{
                #button:Button(2),#the button for the GPIO Pin
                "isHit":False
            }
        }
    },
    "motor3" : {
        "isActive":False,
        "name":"motor3",
        #motor: Motor(forward=4,backward=14); forward is positive, backward is negative
        "endStop":{
            "positive":{
                #button:Button(2),#the button for the GPIO Pin
                "isHit":False
            },
            "negative":{
                #button:Button(2),#the button for the GPIO Pin
                "isHit":False
            }
        }
    },
    "motor4" : {
        "isActive":False,
        "name":"motor4",
        #motor: Motor(forward=4,backward=14); forward is positive, backward is negative
        "endStop":{
            "positive":{
                #button:Button(2),#the button for the GPIO Pin
                "isHit":False
            },
            "negative":{
                #button:Button(2),#the button for the GPIO Pin
                "isHit":False
            }
        }
    }
}

#Setups endstop listening
def end_pressed(_button):
    for m in motors:
        for e in motors[m]["endStop"]:
            #if motors[m]["endStop"][e]["button"] == _button:
            #    motors[m]["motor"].stop()
            #    motors[m]["isActive"]=False
            #    motors[m]["endStop"][e]["isHit"] = True
            print('This amegi')

def end_released(_button):
    for m in motors:
        for e in motors[m]["endStop"]:
            #if motors[m]["endStop"][e]["button"] == _button:
            #    motors[m]["endStop"][e]["isHit"] = False
            print('This too')

for m in motors:
    for e in motors[m]["endStop"]:
        #motors[m]["endStop"][e]["button"]["when_pressed"] = end_pressed
        #motors[m]["endStop"][e]["button"]["when_released"] = end_released
        print('THis')


#############done setting up GPOIZero items

def serve_image():
    global image
    img_io = StringIO()
    imgRGB=cv2.cvtColor(image,cv2.COLOR_BGR2RGB)

    njpg = Image.fromarray(imgRGB)
    njpg.save(img_io, 'JPEG', quality=90)

    #normal image
    img_io.seek(0)
    response=make_response(send_file(img_io,mimetype='image/jpeg'))

    response.headers['Content-Length'] = img_io.len
    return response

def serve_data():
    imageMatch = cv2.imread('matchImage.jpg',0)
    dst_pts = np.float32()
    global image
    img_io = StringIO()
    imgRGB=cv2.cvtColor(image,cv2.COLOR_BGR2RGB)

    #CONVERTING TO gray
    img1 = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
     #0 makes it grayscale #probably could take this out of the loop

    #feature matching
    MIN_MATCH_COUNT = 10

    sift = cv2.xfeatures2d.SIFT_create()

    kp1, des1 = sift.detectAndCompute(img1,None)
    kp2, des2 = sift.detectAndCompute(imageMatch,None)

    FLANN_INDEX_KDTREE = 0
    index_params = dict(algorithm = FLANN_INDEX_KDTREE, trees = 5)
    search_params = dict(checks = 50)

    flann = cv2.FlannBasedMatcher(index_params, search_params)

    matches = flann.knnMatch(des1,des2,k=2)

# store all the good matches as per Lowe's ratio test.
    good = []
    for m,n in matches:
        if m.distance < 0.7*n.distance:
            good.append(m)


    if len(good)>MIN_MATCH_COUNT:
        src_pts = np.float32([ kp1[m.queryIdx].pt for m in good ]).reshape(-1,1,2)
        dst_pts = np.float32([ kp2[m.trainIdx].pt for m in good ]).reshape(-1,1,2)

        print(dst_pts)
        print(src_pts)
        #h, status = cv2.findHomography(src_pts, dst_pts)#from a simpler example
        #print(h)



        #M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC,5.0)
        #matchesMask = mask.ravel().tolist()

        #h,w = img1.shape
        #pts = np.float32([ [0,0],[0,h-1],[w-1,h-1],[w-1,0] ]).reshape(-1,1,2)
        #dst = cv2.perspectiveTransform(pts,M)

    #    img2 = cv2.polylines(img2,[np.int32(dst)],True,255,3, cv2.LINE_AA)

    #else:
        #print "Not enough matches are found - %d/%d" % (len(good),MIN_MATCH_COUNT)
    #    matchesMask = None

    #draw_params = dict(matchColor = (0,255,0), # draw matches in green color
    #               singlePointColor = None,
    #               matchesMask = matchesMask, # draw only inliers
    #               flags = 2)

    #img3 = cv2.drawMatches(img1,kp1,img2,kp2,good,None,**draw_params)



    #njpg = Image.fromarray(imgRGB)
    #njpg = Image.fromarray(img3)button.when_pressed = say_hello
#Here we need to have "ButtonsIsPressed from the gpiozero stuff"
    #njpg.save(img_io, 'JPEG', quality=90)

    #normal image
    #img_io.seek(0)
    #response=make_response(send_file(img_io,mimetype='image/jpeg'))

    #response.headers['Content-Length'] = img_io.len
    #return response

    return jsonify([dst_pts.tolist(),src_pts.tolist()])

def serve_marked_image():
    imageMatch = cv2.imread('matchImage.jpg',0)
    dst_pts = np.float32()
    global image
    img_io = StringIO()

    #CONVERTING TO gray
    img1 = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    imgRGB=cv2.cvtColor(image,cv2.COLOR_BGR2RGB)

    #feature matching
    MIN_MATCH_COUNT = 10
    sift = cv2.xfeatures2d.SIFT_create()

    kp1, des1 = sift.detectAndCompute(img1,None)
    kp2, des2 = sift.detectAndCompute(imageMatch,None)

    FLANN_INDEX_KDTREE = 0
    index_params = dict(algorithm = FLANN_INDEX_KDTREE, trees = 5)
    search_params = dict(checks = 50)

    flann = cv2.FlannBasedMatcher(index_params, search_params)

    matches = flann.knnMatch(des1,des2,k=2)

# store all the good matches as per Lowe's ratio test.
    good = []
    for m,n in matches:
        if m.distance < 0.7*n.distance:
            good.append(m)

    if len(good)>MIN_MATCH_COUNT:
        #these are the points on the captured image
        src_pts = np.float32([ kp1[m.queryIdx].pt for m in good ]).reshape(-1,1,2)
        #dst_pts = np.float32([ kp2[m.trainIdx].pt for m in good ]).reshape(-1,1,2)

        i = 0
        top = 0
        bottom = 0
        left = 0
        right = 0
        for p in src_pts:
            c = p.tolist()
            #this actually
            if i == 0:
                top = c[0][1]
                bottom = c[0][1]
                left = c[0][0]
                right = c[0][0]

            else:
                if c[0][1] > bottom:
                    bottom = c[0][1]
                elif c[0][1] < top:
                    top = c[0][1]

                if c[0][0] > right:
                    right = c[0][0]
                elif c[0][0] < left:
                    left = c[0][0]

            cv2.putText(imgRGB,str(i), (int(c[0][0]),int(c[0][1])), cv2.FONT_HERSHEY_SIMPLEX, 2, 255)
            i += 1;

        print([[top,left],[top,right],[bottom,right],[bottom,left]])
    njpg = Image.fromarray(imgRGB)
    njpg.save(img_io, 'JPEG', quality=90)

    #normal image
    img_io.seek(0)
    response=make_response(send_file(img_io,mimetype='image/jpeg'))
    response.headers['Content-Length'] = img_io.len
    return response

def loopingCamera():
    global capture
    global image
    while True:
        rc,img = capture.read()
        image = img
        time.sleep(0.05)

#These need to connect to a motor and direction
@app.route('/activated')
def pressed():
    motor = request.args.get('motor')
    direct = request.args.get('dir')
    print([motor,direct])
    #need to check if "ispressed"
    return jsonify([])


@app.route('/deactivated')
def released():
    motor = request.args.get('motor')
    print([motor])
    return 'released'


app.add_url_rule('/data.json','data', serve_data)
app.add_url_rule('/image.jpg','image',serve_image)
app.add_url_rule('/image_marked.jpg','marked_image',serve_marked_image)


if __name__ == '__main__':
    global capture
    global captureThread
    try:
        capture = cv2.VideoCapture(0)
        captureThread = threading.Thread(target=loopingCamera, args=())
        captureThread.start()
        app.run(host='0.0.0.0')
    except KeyboardInterrupt:
        captureThread.stop()
