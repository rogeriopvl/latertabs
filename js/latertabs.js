var LaterTabs = {

    tabs: {},

    init: function(callback){
        chrome.storage.sync.get('tabs', function(value){
            if (value){
                LaterTabs.tabs = value.tabs;
                if (callback){
                    callback();
                }
            }
        });
    },

    syncStorage: function(){
        chrome.storage.sync.set({tabs: LaterTabs.tabs});
    },

    save: function(item){
        if (LaterTabs.tabs[item.url]){
            return false;
        }
        LaterTabs.tabs[item.url] = item;
        LaterTabs.syncStorage();
        return true;
    },

    remove: function(url){
        if (LaterTabs.tabs[url]){
            delete LaterTabs.tabs[url];
            LaterTabs.syncStorage();
            LaterTabs.notify('Tab removed', url);
            return true;
        }
        return false;
    },

    saveCurrent: function(callback){
        chrome.tabs.getSelected(null, function(tab){
            LaterTabs.save({ url: tab.url, title: tab.title });
            LaterTabs.notify('Tab saved', tab.url);
            if (callback){ callback(); }
        });
    },

    saveAll: function(callback){
        chrome.tabs.getAllInWindow(null, function(tabs){
            for (var i = 0, tlength = tabs.length; i < tlength; i++){
                LaterTabs.save({ url: tabs[i].url, title: tabs[i].title });
            }
            LaterTabs.notify('All tabs saved', '');
            if (callback){ callback(); }
        });
    },

    restore: function(url){
        chrome.tabs.create({'url': url}, function(tab) {
            LaterTabs.notify('Tab restored', url);
        });
    },

    getSaved: function(){
        return LaterTabs.tabs;
    },

    notify: function(title, text){
        var notification = webkitNotifications.createNotification(
            '/imgs/clock.png',
            title,
            text
        );
        notification.show();
    }
};

(function(){
    LaterTabs.init(createList);

    function setupListeners(){
        var closeButton = document.getElementById('close_button');
        var saveButton = document.getElementById('save_current_tab_button');
        var saveAllButton = document.getElementById('save_all_tabs_button');
        var settingsButton = document.getElementById('settings_button');
        var tablist = document.getElementsByTagName('article');

        closeButton.addEventListener('click', function(){
            window.close();
        });

        saveButton.addEventListener('click', function(){
            LaterTabs.saveCurrent(createList);
        });

        saveAllButton.addEventListener('click', function(){
            LaterTabs.saveAll(createList);
        });

        settingsButton.addEventListener('click', function(){
            chrome.tabs.create({ url: "options.html" });
        });

        for (var i = 0, tlength = tablist.length; i < tlength; i++){
            var deleteButton = tablist[i].getElementsByTagName('i')[0];
            deleteButton.addEventListener('click', function(){
                LaterTabs.remove(this.nextSibling.innerHTML);
                createList(); // quick hack to update list
            });

            tablist[i].children[0].addEventListener('click', function(){
                LaterTabs.restore(deleteButton.nextSibling.innerHTML);
            });
        }
    }

    function createList(){
        var items = LaterTabs.tabs,
            htmlContent = '';
        for (var i in items){
            if (items.hasOwnProperty(i)){
                htmlContent += '<li class="todo">';
                htmlContent += '<div class="todo-icon fui-time-24"></div>';
                htmlContent += '<div class="todo-content">';
                htmlContent += '<h4 class="todo-name">' + items[i].title + '</h4>';
                htmlContent += ' ' + items[i].url + '</div></li>';
            }
        }
        document.getElementById('tab_list').innerHTML = htmlContent;
        setupListeners();
    }
})();
