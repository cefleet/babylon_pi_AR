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
    #njpg = Image.fromarray(img3)
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
        src_pts = np.float32([ kp1[m.queryIdx].pt for m in good ]).reshape(-1,1,2)
        dst_pts = np.float32([ kp2[m.trainIdx].pt for m in good ]).reshape(-1,1,2)

        print(dst_pts)
        print(src_pts)
        #h, status = cv2.findHomography(src_pts, dst_pts)#from a simpler example
        #print(h)

        i = 0
        for p in src_pts:
            c = p.tolist()
            #print(c[0])
            #print(c[1])
            cv2.putText(imgRGB,str(i), (int(c[0][0]),int(c[0][1])), cv2.FONT_HERSHEY_SIMPLEX, 2, 255)
            i += 1;

    njpg = Image.fromarray(imgRGB)
    njpg.save(img_io, 'JPEG', quality=90)

    #normal image
    img_io.seek(0)
    response=make_response(send_file(img_io,mimetype='image/jpeg'))

    #response.headers['Content-Length'] = img_io.len
    return response



def loopingCamera():
    global capture
    global image
    while True:
        rc,img = capture.read()
        image = img
        time.sleep(0.05)


@app.route('/pressed')
def pressed():
    direct = request.args.get('direct')
    print(direct)
    return 'pressed'

@app.route('/released')
def released():
    direct = request.args.get('direct')
    print(direct)

    return 'released'


#@app.route('/index')
#def root():
#  return app.send_static_file('index.html')

#@app.route('/babylon.js')
#def babylon():
#  return app.send_static_file('babylon.js')

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
