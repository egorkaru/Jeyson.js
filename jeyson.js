function Jeyson(opts){
  opts = opts || {
    type: 'spreadsheets',
    path: '156_qbJNRJlyr_0i_HCFIuVv4Qg8ziV5o8uR-x7ZuvPY'
  }
var headerBlog = new Vue({
  el: '#headerBlog',
  data: {
    blog_name: '',
    links: [],
  },
  methods: {
    updateName: function (e) {
      this.blog_name = e
      console.log(this.$el.textContent, e) // => 'not updated'
      this.$nextTick(function () {
        console.log(this.$el.textContent, e) // => 'updated'
      })}
  },
  filters: {
    marked: marked
  },
})

var headerPost = new Vue({
  el: '#headerPost',
  data: {
    title: '',
    subtitle: '',
  },
})

var listPost = new Vue({
  el: '#listPost',
  data: {
    posts: [],
  },
  filters: {
    marked: marked,
    trim: function(value, n){
      return value.substring(0, n);
    }
  },
})

var store = {
        _posts: [],
        _config: {},
        _links: [],
        _url: 'http://cors.io/?u=https://docs.google.com/spreadsheets/d/'+opts.path+'/pub?output=csv',
        _ended: function(){
          /*headerBlog.blog_name = store._config.content
          headerPost.title = store._config.title
          headerPost.subtitle = store._config.subtitle
          headerBlog.links = store._links
          listPost.posts = store._posts*/
          processHash();
        },
        _parse: function(data){
          for (i=0; i<data.length; i++){
            url = data[i].url
            /*store[url] = { 'title' : data[i].title,
                          'subtitle' : data[i].subtitle,
                          'content' : data[i].content
                        }*/
            if(url != '_config' && url !='_links' && url != ''){
              store._posts.push(data[i])
            }
            if(url == '_config'){
              store._config = data[i]
            }
            if(url == '_links'){
              store._links = data[i].content.split(",")
            }
          }
          store._ended()
          console.log(data)
        },
        _init: function(){
          Papa.parse(store._url, {
            download: true,
            header: true,
            complete: function(results) {
              store._parse(results.data)
            }
          });
        },
        getPost: function(url){
          for (i=0;i<store._posts.length;i++){
            if (store._posts[i].url == url){
              return store._posts[i]
            }
          }
        }
      }
store._init()

var r = Rlite()
r.add('!/post/:url', function(r) {
    headerBlog.blog_name = store._config.content
    headerBlog.links = store._links
    headerPost.title = store.getPost(r.params.url).title
    headerPost.subtitle = store.getPost(r.params.url).subtitle
    listPost.posts = [
      {
        content: store.getPost(r.params.url).content
      }
    ]
});

r.add('!/all', function() {
    headerBlog.blog_name = store._config.content
    headerPost.title = store._config.title
    headerPost.subtitle = store._config.subtitle
    headerBlog.links = store._links
    listPost.posts = store._posts
});

function processHash() {
  var hash = location.hash || '#';
  r.run(hash.slice(1));
  if (!r.run(hash.substr(1))) {
    location.hash = '!/all'
  }
}

window.addEventListener('hashchange', processHash);
processHash();
}
