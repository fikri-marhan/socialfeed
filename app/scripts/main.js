'use strict';

var loggedIn = $.Deferred();
loggedIn.done(function(auth){

});

hello.init({
	facebook : '326111060869778',
	instagram: 'e5758d292c1942188375cd01dd1359f7',
	twitter  : 'Nj4X7CwNmBLz0SKxyE52xU46z'
}, {redirect_uri: '/'});

hello.on('auth.login', function(auth){
	$('#login-'+auth.network).find('.btn-text').html('Logged In..').fadeOut(1000);
	switch(auth.network)
	{
		case 'facebook':
			$('#login-'+auth.network).css('color','#3b5998');
			hello( auth.network ).api('/me/statuses?limit=10').success(fbStatusCollection.resolve);
			break;

		case 'instagram':
			$('#login-'+auth.network).css('color','#964B00');
			hello( auth.network ).api('/users/self/media/recent?count=10').success(instagramGetUserMedia.resolve);
			break;

		case 'twitter':			
			$('#login-'+auth.network).css('color','#00aced');
			hello( auth.network ).api('/statuses/user_timeline.json?count=10').success(twitterGetUserStatus.resolve);
			break;

	}
});


//Facebook
var fbStatusCollection = $.Deferred();
fbStatusCollection.done(function(response){
	var feeds = response.data;
	//console.log(feeds);
	$.each(feeds,function(idx, feed){
		insertNewFeed('#facebook-feed-template',{
			id: Date.parse(feed.updated_time),
			mediaSrcImgUrl: 'http://graph.facebook.com/'+feed.from.id+'/picture?type=square',
			mediaSrcText: '..',
			mediaHeading: 'Facebook',
			mediaContent: feed.message
		});
	});
});

//Instagram
var instagramGetUserMedia = $.Deferred();
instagramGetUserMedia.done(function(response){
	var medias = response.data;
	$.each(medias,function(idx, media){
		var user = media.user;
		insertNewFeed('#instagram-feed-template',{
			id: media.caption.created_time * 1000,
			mediaSrcImgUrl: user.profile_picture,
			mediaSrcText: user.full_name,
			mediaHeading: 'Instagram',
			instagramImgSrc: media.images.low_resolution.url,
			instagramImgTitle: '',
		});
	});
});

//Twitter
var twitterGetUserStatus = $.Deferred();
twitterGetUserStatus.done(function(response){
	var tweets = response;
	$.each(tweets,function(idx, tweet){
		var user = tweet.user;
		insertNewFeed('#twitter-feed-template',{
			id: Date.parse(tweet.created_at),
			mediaSrcImgUrl: user.profile_image_url,
			mediaSrcText: user.name,
			mediaHeading: 'Twitter',
			mediaContent: tweet.text
		});
	});
});

//page specific helper functions
function insertNewFeed(templateId, data)
{
	var template = $(templateId).html();
	var rendered = Mustache.render(template, data);

	var medias = $('#feed').find('.media');
	if(medias.length)
	{
		var inserted = false;
		medias.each(function(idx, media){
			if($(media).attr('id') < data.id){
				$(rendered).insertBefore($(media));
				inserted = true;
				return false;
			}
		});
		if(!inserted){
			$('#feed').append($(rendered));
		}
	}
	else
	{
		$('#feed').append($(rendered));
	}
}