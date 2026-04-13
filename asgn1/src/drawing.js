function drawingOTris(){
    var scale = 1.0;
    var t1 = [scale,-1*scale, -1*scale,-1*scale, 0,scale];
    var t2;
    var t3;

    for(var ind = 0; ind < 10; ind++){
        t2 = average(t1);

        for(var i = 0; i < 6; i+=2){
            var next = (i + 2) % 6;

            t3 = average([t1[i],t1[i+1],  t2[i],t2[i+1],  t2[next],t2[next+1]]);

            gl.uniform4f(u_FragColor, Math.random(),Math.random(),Math.random(), 1.0)
            drawTriangle(t3);
        }
        
        gl.uniform4f(u_FragColor, Math.random(),Math.random(),Math.random(), 1.0)
        drawTriangle(t1);
        t1 = t2;
    }

    var ell = [[-0.8,0.8, -0.7,0.8, -0.8,0.2],[-0.8,0.2, -0.7,0.8, -0.7,0.2],
               [-0.7,0.2, -0.4,0.2, -0.4,0.3],[-0.7,0.2, -0.7,0.3, -0.4,0.3]];

    gl.uniform4f(u_FragColor, Math.random(),Math.random(),Math.random(), 1.0);
    drawTriangle(ell[0]);
    drawTriangle(ell[1]);
    drawTriangle(ell[2]);
    drawTriangle(ell[3]);

    var aych = [[0.8,0.8, 0.7,0.8, 0.8,0.2],[0.8,0.2, 0.7,0.8, 0.7,0.2],
                [0.5,0.45, 0.5,0.55, 0.7,0.55],[0.7,0.55, 0.7,0.45, 0.5,0.45],
                [0.4,0.2, 0.4,0.8, 0.5,0.2],[0.4,0.8, 0.5,0.8, 0.5,0.2]];

    gl.uniform4f(u_FragColor, Math.random(),Math.random(),Math.random(), 1.0);
    drawTriangle(aych[0]);
    drawTriangle(aych[1]);
    drawTriangle(aych[2]);
    drawTriangle(aych[3]);
    drawTriangle(aych[4]);
    drawTriangle(aych[5]);
}

function average(tri){
    [x1,y1,x2,y2,x3,y3] = [ (tri[0] + tri[2])/2, (tri[1] + tri[3])/2, 
            (tri[2] + tri[4])/2, (tri[3] + tri[5])/2,
            (tri[4] + tri[0])/2, (tri[5] + tri[1])/2 ]


    return [x1,y1,x2,y2,x3,y3];
}
