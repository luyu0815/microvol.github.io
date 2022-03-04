
(function () {
    var elements = document.getElementsByTagName("pre");
    for(var i=0; i<elements.length; ++i){
        elements[i].classList.add("language-none");
        elements[i].classList.add("line-numbers");
    }
    // $('pre').addClass("language-none");
    // $('pre').addClass("line-numbers").css("white-space", "pre-wrap");
}());

window.onload = function(){
}

var sleep = function(time) {
    var startTime = new Date().getTime() + parseInt(time, 10);
    while(new Date().getTime() < startTime) {}
};

$(document).ready(function(){
    $("#sidebar ul .show").slideDown(200);
    registerSidebarClick();
    addTOC();
    addSequence();
    var has_sidebar = document.getElementById("sidebar_wrapper");
    if(has_sidebar){
        addSplitter();
        focusSidebar();
    }
    addAnchor();
    registerOnWindowResize(has_sidebar);
    hello();
    imageViewer();
    if(true){
        addPrintPage();
    }
});

var sidebar_width = "300px";
var sidebar_width_is_percent = false;
try{
    if(isNaN(sidebar_width)){
        if(sidebar_width.endsWith("px")){
            sidebar_width = parseInt(sidebar_width.substr(0, sidebar_width.length-2));
        }else if(sidebar_width.endsWith("%")){
            sidebar_width = parseInt(sidebar_width.substr(0, sidebar_width.length-1));
            sidebar_width_is_percent = true;
        }else{
            sidebar_width = parseInt(sidebar_width);
        }
    }
}catch(err){
    alert('plugin theme env sidebar_width value error, e.g. 300 or "300px" or "30%", not ' + sidebar_width);
}

function menu_show(show)
{
    if(show){
        $("#menu").addClass("m_menu_fixed");
        $("#menu").addClass("close");
        $("#to_top").addClass("m_hide");
        $("#sidebar_wrapper").show(100);
        $(".gutter").css("display", "block");
    }else{
        $("#menu").removeClass("m_menu_fixed");
        $("#menu").removeClass("close");
        $("#to_top").removeClass("m_hide");
        $("#sidebar_wrapper").hide(100);
        $(".gutter").css("display", "none");
        $("#article").css("width", "100%"); // recover set by splitter
    }
}
function menu_toggle(){
    if(!$("#sidebar_wrapper").is(':visible')){ // show
        menu_show(true);
    }else{ // hide
        menu_show(false);
    }
}

function registerSidebarClick(){
    function show_collapse_item(a_obj){
        var o_ul = a_obj.next();
        var collapsed = !o_ul.hasClass("show");
        if(collapsed){
            o_ul.slideDown(200);
            o_ul.removeClass("collapsed");
            o_ul.addClass("show");
            a_obj.children(".sub_indicator").removeClass("sub_indicator_collapsed");
        }else {
            o_ul.slideUp(200);
            o_ul.removeClass("show");
            o_ul.addClass("collapsed");
            a_obj.children(".sub_indicator").addClass("sub_indicator_collapsed");
        }
    }
    $("#sidebar ul li > a").bind("click", function(e){
        var is_click_indicator = $(e.target).hasClass("sub_indicator");
        var a_obj = $(this);
        if(a_obj.attr("href") == window.location.pathname){
            show_collapse_item(a_obj);
            return false;
        }
        show_collapse_item(a_obj);
        if(is_click_indicator){ // click indicator, only collapse, not jump to link
            return false;
        }
    });
    $("#menu").bind("click", function(e){
        menu_toggle();
    });
    $("#navbar_menu_btn").bind("click", function(e){
        $("#navbar_items").toggle();
    });
    var theme = getTheme();
    setTheme(theme);
    $("#themes").bind("click", function(e){
        var theme = getTheme();
        if(theme == "light"){
            setTheme("dark");
        }else {
            setTheme("light");
        }
    });
    $("#to_top").bind("click", function(e){
        window.scrollTo({
                            top: 0, 
                            behavior: "smooth" 
                        });
        return false;
    });
}

function hello(){
    console.log('\n\n\
     _                _            \n\
    | |              | |           \n\
    | |_ ___  ___  __| | ___   ___ \n\
    | __/ _ \\/ _ \\/ _` |/ _ \\ / __|\n\
    | ||  __/  __/ (_| | (_) | (__ \n\
     \\__\\___|\\___|\\__,_|\\___/ \\___|\n\
                                         \n\
                 generated by teedoc:            \n\
                                                 \n\
                 https://github.com/teedoc/teedoc\n\
                                                 \n\n\n\
');
}


function addTOC(){
    if(!document.getElementById("toc_content"))
        return;
    tocbot.init({
        // Where to render the table of contents.
        tocSelector: '#toc_content',
        // Where to grab the headings to build the table of contents.
        contentSelector: '#article_content',
        // Which headings to grab inside of the contentSelector element.
        headingSelector: 'h1, h2, h3, h4',
        // For headings inside relative or absolute positioned containers within content.
        hasInnerContainers: true,
        });
}

function toChineseNumber(n) {
    if (!Number.isInteger(n) && n < 0) {
      throw Error('请输入自然数');
    }
  
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const positions = ['', '十', '百', '千', '万', '十万', '百万', '千万', '亿', '十亿', '百亿', '千亿'];
    const charArray = String(n).split('');
    let result = '';
    let prevIsZero = false;
    //处理0  deal zero
    for (let i = 0; i < charArray.length; i++) {
      const ch = charArray[i];
      if (ch !== '0' && !prevIsZero) {
        result += digits[parseInt(ch)] + positions[charArray.length - i - 1];
      } else if (ch === '0') {
        prevIsZero = true;
      } else if (ch !== '0' && prevIsZero) {
        result += '零' + digits[parseInt(ch)] + positions[charArray.length - i - 1];
      }
    }
    //处理十 deal ten
    if (n < 100) {
      result = result.replace('一十', '十');
    }
    return result;
  }

function addSequence(){
    var headings = tocbot._parseContent.selectHeadings(document.getElementById("article_content"), tocbot.options.headingSelector);
    var counth2=0, counth3=0, counth4=0;
    var html = document.getElementsByTagName("html")[0];
    var isZh = html.lang.substr(0, 2).toLowerCase() == "zh";
    for(var i=0; i<html.classList.length; ++i){
        if(html.classList[i] == "heading_no_counter"){
            return;
        }
    }
    for(var i=0; i<headings.length; ++i){
        if(headings[i].tagName == "H1"){
            counth2 = 0;
        } else if(headings[i].tagName == "H2"){
            counth2 += 1;
            counth3 = 0;
            if(isZh){
                var seq = toChineseNumber(counth2) + '、';
            }else{
                var seq = counth2 + '、';
            }
            headings[i].insertAdjacentHTML('afterbegin', '<span class="sequence">' + seq + '</span>');
        } else if(headings[i].tagName == "H3"){
            counth3 += 1;
            counth4 = 0;
            var seq = counth2 + '.' + counth3 + "、";
            headings[i].insertAdjacentHTML('afterbegin', '<span class="sequence">' + seq + '</span>');
        } else if(headings[i].tagName == "H4"){
            counth4 += 1;
            var seq = counth2 + '.' + counth3 + '.' + counth3 + "、";
            headings[i].insertAdjacentHTML('afterbegin', '<span class="sequence">' + seq + '</span>');
        }
    }
}


function getSplitter(){
    var sizes = localStorage.getItem("splitter_w");
    if(sizes){
        try
        {
        sizes = JSON.parse(sizes);
        }
        catch(err)
        {
            sizes = false;
        }
    }
    if(!sizes){
        var screenW = $(window).width();
        var split_w = 0;
        if(!sidebar_width_is_percent){
            split_w = parseInt(sidebar_width/screenW*100);
        }else{
            split_w = sidebar_width;
        }
        sizes = [split_w, 100-split_w];
        setSplitter(sizes);
    }
    return sizes;
}
function setSplitter(sizes){
    localStorage.setItem("splitter_w", JSON.stringify(sizes));
}

var hasSplitter = false;

function createSplitter(){
    var split = Split(["#sidebar_wrapper", "#article"],{
        gutterSize: 3,
        gutterAlign: 'start',
        minSize: 200,
        elementStyle: function (dimension, size, gutterSize) {
            return {
                'width': 'calc(' + size + '% - ' + gutterSize + 'px)',
            }
        },
        onDragEnd: function (sizes) {
            setSplitter(sizes)
        },
    });
    hasSplitter = true;
    var screenW = $(window).width();
    var sizes = getSplitter();
    split_w = parseInt(sizes[0]);
    if(isNaN(split_w) || (split_w + 20) >= screenW){
    if(!sidebar_width_is_percent){
    split_w = parseInt(sidebar_width/screenW*100);
    }else{
    split_w = sidebar_width;
    }
    }
    split.setSizes([split_w, 100 - split_w]);
    $(".gutter").append('<div class="gutter_icon"></div>');
    $(".gutter").hover(function(){
        $(".gutter").css("width", "10px");
        $(".gutter_icon").css("width", "10px");
    },function(){
        $(".gutter").css("width", "3px");
        $(".gutter_icon").css("width", "3px");
    });
}

function addSplitter(){
    var screenW = $(window).width();
    if(screenW > 900)
    {
        createSplitter();
    }
}

function registerOnWindowResize(has_sidebar){
    window.onresize = function(){
        var screenW = $(window).width();
        if(!has_sidebar){
            return;
        }
        if(screenW < 900){
            console.log($("#sidebar_wrapper").attr("style"));
            $("#sidebar_wrapper").removeAttr("style");
            if($("#menu").hasClass("close")){
                $("#sidebar_wrapper").css("display", "block");    
            }
            $(".gutter").css("display", "none");
        }else{
            if(!hasSplitter){
                createSplitter();
            }
            if($("#sidebar_wrapper").css("display") != "none"){
                $(".gutter").css("display", "block");
            }
        }
    }
}

function focusSidebar(){
    var windowH = window.innerHeight;
    var active = $("#sidebar .active")[0];
    if(!active)
        return;
    var offset = active.offsetTop;
    if(offset > windowH/2){
        $("#sidebar .show").scrollTop(offset);
    }
}

function imageViewer(){
    var content_e = document.getElementById("content_body");
    if(!content_e){
        content_e = document.getElementById("page_wrapper");
    }
    const gallery = new Viewer(content_e);
}

function addAnchor(){
    $("#content_body h2, #content_body h3, #content_body h4, #content_body h5").each(function(){
        if($(this).attr("id")){
            $(this).append('<a class="anchor" href="#'+ $(this).attr("id") +'">#</a>');
        }
    });
}

function rerender(){
    Prism.highlightAll();
}

function addPrintPage(){
    if(!$("#article_info_right")){
        return;
    }
    $("#article_info_right").append('<div id="print_page"></div>');

    var beforePrint = function(){
        // update style changed by js:
        $("#article").css("width", "100%");
        // rerender for proper output
        rerender();
    }
    var afterPrint = function() {
        // location.reload();
    }
    if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print'); 
        mediaQueryList.addListener(function(mql) {
            if (mql.matches) {
                beforePrint();
            } else {
                afterPrint();
            }
        });
    }
    window.onbeforeprint = beforePrint;
    window.onafterprint = afterPrint;
    $("#print_page").click(function(){
        window.print();
    });
}