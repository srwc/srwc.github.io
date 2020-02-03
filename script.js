let posts = {}

let page_updating = false
let page_before = null
let page_after = null

function load_page(link) {
    if(page_updating) return;
    page_updating = true
    let page = document.getElementById("page")
    fetch(link)
    .then(response => response.json())
    .then(json => {
        //console.log(vars)
        //console.log(link)
        if(json["error"]) {
            alert(json["error"])
        }else{
            page_before = json.data.before
            page_after = json.data.after 
            for(c in json.data.children) {
                let child = json.data.children[c]
                //Post ID
                let post_id = makeid(6)
                let new_video
                while(posts[post_id]) {
                    post_id = makeid(6)
                }
                posts[post_id] = true
                //Propriedades
                let title = child.data.title
                let url = child.data.url
                let score = child.data.score
                let author = child.data.author
                let subreddit = child.data.subreddit
                let comments = child.data.num_comments
                let desc = (child.data.selftext.length > 0 ? child.data.selftext : false)
                let thumb = child.data.thumbnail
                let image = (child.data.preview ? (child.data.preview.images ? (child.data.preview.images[0] ? child.data.preview.images[0].source.url : false) : false) : false)
                let vreddit = (child.data.is_video ? child.data.media.reddit_video.dash_url : false)
                let nsfw = child.data.over_18
                let spoiler = child.data.spoiler
                let stickied = child.data.stickied
                //Create post
                let new_div = document.createElement("div")
                new_div.className = "post"
                //Post Header
                new_div.innerHTML = "<div class='header'><a class='thumb' id='thumb-"+post_id+"'>"+(thumb.includes(".") ? "<img src="+thumb+">" : "<i class='material-icons md-18'>chat_bubble</i>")+"</a><a class='points'>"+score+"</br>Points</a><a class='title'>"+title+"</a></div>"
                //Post Content
                let content = (image ? "<div class='center'><img src="+image+"></div>" : "")
                if(url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg")) {
                    content = (image ? "<div class='center'><img src="+image+"></div>" : "<div class='center'><img src="+url+"></div>")
                }else if(url.match("imgur.com")) {
                    content = "<div class='center'><blockquote class='imgur-embed-pub' lang='en' data-id="+url.split("/")[url.split("/").length-1].split(".")[0]+" data-context='true'></blockquote></div>"
                }else if(url.match("gfycat.com")) {
                    content = "<div style='position:relative; margin: 5px; padding-bottom:calc(70.80% + 44px)'><iframe src='https://gfycat.com/ifr/"+url.split("/")[url.split("/").length-1].split(".")[0].split("-")[0]+"' frameborder='0' scrolling='no' width='100%' height='100%' style='position:absolute;top:0;left:0;' allowfullscreen></iframe></div>"
                }else if(url.match("youtube.com")) {
                    content = "<div class='center'><iframe id='ytplayer' style='width: 100%; height:441; max-width: 784' type='text/html' src='http://www.youtube.com/embed/"+(url.split("v=")[1].indexOf('&') != -1 ? url.split("v=")[1].substring(0, url.split("v=")[1].indexOf("&")) : url.split("v=")[1])+"' frameborder='0'/></div>"
                }else if(vreddit) {
                    new_video = vreddit
                    content = "<div class='center'><video id='video-"+post_id+"' controls></video></div>"
                }
                var markdown_converter = new showdown.Converter()
                new_div.innerHTML += "<div class='content' id='content-"+post_id+"'></div>"
                //Post Footer
                new_div.innerHTML += "<div class='footer'><a>Posted by /u/"+author+" at /r/"+subreddit+"</a><div class='space'></div><a><i class='material-icons md-18'>chat_bubble</i> "+comments+" Comments</a></div>"
                //Post properties
                if(stickied) new_div.classList.add("stickied")
                if(nsfw) new_div.classList.add("nsfw")
                if(spoiler) new_video.classList.add("spoiler")
                //Append Post
                page.appendChild(new_div)
                let post_thumb = document.getElementById("thumb-"+post_id)
                let post_content = document.getElementById("content-"+post_id)
                post_thumb.onclick = function() {
                    if(post_content.innerHTML.length > 0) post_content.innerHTML = ""
                    else {
                        post_content.innerHTML = (desc ? "<div class='text'>"+markdown_converter.makeHtml(desc)+"</div>" : "")+content
                        window.imgurEmbed.createIframe ? imgurEmbed.createIframe() : imgurEmbed.tasks++;
                        if(new_video) {
                            var player = dashjs.MediaPlayer().create();
                            player.initialize(document.querySelector("#video-"+post_id), new_video, false);
                        }
                    }
                }
                
                page_updating = false
            }
        }
    })
}

var vars = {};
var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
});
if(vars["s"] == null) {
    window.location.href = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, "")+"?s=all"
}

let topnav = document.getElementById("topnav")
let period = document.getElementById("period")
if(!period) {
    if(vars["order"] == "controversial" || vars["order"] == "top") {
        let msg = {
            hour: "Last Hour",
            day: "Last Day",
            week: "Last Week",
            month: "Last Month",
            year: "Last Year",
            all: "All Time"
        }
        period = document.createElement("a")
        period.onclick = function() {
            let context = document.getElementById("period_context")
            if(context) period.removeChild(context)
            else { 
                context = document.createElement("div")
                context.id = "period_context"
                let new_msg = {}
                for(m in msg) 
                    if(vars["period"] != m) new_msg[m] = msg[m]
                for(m in new_msg)
                    context.innerHTML += "<a onclick='set_period(\""+m+"\")'>"+new_msg[m]+"</a>"
                period.appendChild(context)
            }
        }
        period.innerText = msg[vars["period"]]
        topnav.appendChild(period)
    }
}else{
    if(vars["order"] != "controversial" && vars["order"] != "top") {
        topnav.removeChild(period)
    }
}

load_page("https://reddit.com/r/"+vars["s"]+(vars["order"] ? "/"+vars["order"] : "")+".json"+(vars["period"] ? "?sort="+vars["order"]+"&t="+vars["period"] : ""))

document.body.onscroll = function() {
    if (document.body.scrollTop + document.body.clientHeight > document.body.offsetHeight-document.body.clientHeight) {
        load_page("https://reddit.com/r/"+vars["s"]+(vars["order"] ? "/"+vars["order"] : "")+".json?count=25&after="+page_after+(vars["period"] ? "&sort="+vars["order"]+"&t="+vars["period"] : ""))
    }
};

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 