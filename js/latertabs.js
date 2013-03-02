var laterTabs = {

    init: function(){
        if (typeof localStorage.latertabs == 'undefined'){
            localStorage.latertabs = [];
        }
    },

    save: function(url){
       localStorage.latertabs.push(url);
    },

    saveAll: function(urls){
 
        // get all open tabs urls

        for (var i in urls){
            this.save(urls[i]);
        }
    },

    restore: function(url){
        // open all saved urls in tabs
    }
};
