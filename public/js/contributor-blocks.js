// Component that manages the contributor list as a whole
pui.component('contributor-blocks', function(doc) {
  var that = this;
  var data;
  var active_contributor;

  this.init = function() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) { //SUCCESS
        that.announce('contributors:received');
        data = JSON.parse(req.response);
        that.buildContributorBlocks();
        that.announce('contributors:presented');
      } else if (req.readyState == 4 && req.status != 200) { //FAIL
        data = [];
        doc.innerHTML = 'Unable to retrieve contributors for ' + that.config.owner + '/' + that.config.repo + '.'
        that.announce('contributors:unavailable');
      }
    };
    req.open("GET", 'https://api.github.com/repos/' + that.config.owner + '/' + that.config.repo + '/contributors', false);
    req.send();
  }

  this.buildContributorBlocks = function() {
    for(var i = 0, contributor; contributor = data[i]; i++) {
      var block = document.createElement('div')
      block.className = 'contributor';
      block.style.backgroundImage = "url('" + contributor.avatar_url + "')";
      block.setAttribute('data-ui', 'contributor-block');

      var cover = document.createElement('div');
      cover.className = 'cover';
      block.appendChild(cover);

      var info = document.createElement('div');
      info.className = 'info-wrapper';

      var username = document.createElement('a');
      username.className = 'username';
      username.href = contributor.html_url;
      username.target = '_blank';
      username.innerHTML = contributor.login;
      info.appendChild(username);

      var count = document.createElement('div');
      count.className = 'count';
      count.innerHTML = contributor.contributions;
      info.appendChild(count);

      var text = document.createElement('div');
      text.class = 'text';
      text.innerHTML = (contributor.contributions > 1) ? 'contributions' : 'contribution';
      info.appendChild(text);

      block.appendChild(info);
      doc.appendChild(block);

      block.onclick = that.handleClick;
    }

    pui.componentize('contributor-block');
  }

  this.trackActiveContributor = function(contributor) {
    if (!!active_contributor) active_contributor.deactivate();
    active_contributor = contributor;
  }

  this.forgetActiveContributor = function() {
    active_contributor = null;
  }

  this.findActiveContributor = function() {
    return active_contributor;
  }

  this.react('contributor:activated', that.trackActiveContributor);
  this.react('contributor:deactivated', that.forgetActiveContributor);
  this.react('contributors:findActive', that.findActiveContributor);
});


// Component that manages each individual contributor in the list
pui.component('contributor-block', function(doc) {
  var that = this;

  this.init = function() {
    doc.onclick = that.handleClick;
  }

  this.handleClick = function(e) {
    if (e.target.className.search(/username/) >= 0) {
      e.stopPropagation();
    } else if (doc.className.search(/active/) >= 0) {
      that.deactivate();
    } else {
      that.activate();
    }
  }

  this.activate = function() {
    doc.className += ' active';
    that.announce('contributor:activated', that);
  }

  this.deactivate = function() {
    doc.className = doc.className.replace(/\s?active/, '');
    that.announce('contributor:deactivated');
  }
});