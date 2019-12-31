var m_analyzer;
var m_renderer;
// var m_mouse;
var m_render_queue;
var m_blob;
var m_pbr;
var m_light;
var m_ctrl;
var m_device_checker;


var mouse = [];

// Follows the mouse event
function onMouseMove(event) {

    // Update the mouse variable
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

 // Make the sphere follow the mouse
  // var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  //   vector.unproject( camera );
  //   var dir = vector.sub( camera.position ).normalize();
  //   var distance = - camera.position.z / dir.z;
  //   var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
  //   mouseMesh.position.copy(pos);
  
    // Make the sphere follow the mouse
//  mouseMesh.position.set(event.clientX, event.clientY, 0);
};


var init = function(){
    // device_checker
    // m_device_checker = new DeviceChecker();
    var _is_mobile = true;//m_device_checker.is_mobile();
    // var _is_retina = m_device_checker.is_retina();

    // init audio input analyzer
    m_analyzer = new AudioAnalyzer();
    // init mouse handler
    // m_mouse = new MouseHandler();
    // m_mouse.register_dom_events(document.body);
    
    // init shared renderer
    var _is_perspective = true;
    m_renderer = new ThreeSharedRenderer(_is_perspective);
    m_renderer.append_renderer_to_dom(document.body);
    m_renderer.renderer.autoClear = true;

    // init pbr
    m_pbr = new ThreePBR();
    // init light
    m_light = new ThreePointLight();

    // init blob
    m_blob = new NoiseBlob(m_renderer, m_analyzer, m_light);
    m_blob.set_PBR(m_pbr);
    // if(_is_retina) m_blob.set_retina();
    
    // setup render queue
    m_render_queue = [
        m_blob.update.bind(m_blob)
    ];


    // When the mouse moves, call the given function
    document.addEventListener('mousemove', onMouseMove, false);
    // init gui
    // m_ctrl = new Ctrl(m_blob, m_light, m_pbr, m_analyzer);
};


var update = function(){
    setTimeout(function(){requestAnimationFrame( update );}, 60);
    
    // update audio analyzer
    m_analyzer.update();
    // m_analyzer.debug(document.getElementsByTagName("canvas")[0]);

    // update blob
    // m_blob.update_PBR();

    // console.log("d");
    m_blob.update_positions();
    // update pbr
    // m_pbr.exposure = 5. 
    //     + 30. * m_analyzer.get_level();

    // update light
    // if(m_ctrl.params.light_ziggle) 
        // m_light.ziggle( m_renderer.timer );

    // update renderer
    // if(m_ctrl.params.cam_ziggle) 
        m_renderer.ziggle_cam(m_analyzer.get_history(), mouse.x, mouse.y); //moves  camera
    m_renderer.render(m_render_queue);
};


document.addEventListener('DOMContentLoaded', function()
{
    init();
    update();
});
