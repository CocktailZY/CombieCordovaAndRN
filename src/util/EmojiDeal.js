var emojimap = {
	sunny: '太阳',
	cloud: '云朵',
	chicken: '小鸡',
	beetle: '瓢虫',
	ok_hand: 'OK',
	'+1': '点赞',
	'-1': '倒赞',
	clap: '鼓掌',
	grinning: '轻笑',
	grin: '眯眼',
	joy: '笑哭',
	smiley: '开心',
	smile: '眯笑',
	sweat_smile: '汗颜',
	laughing: '可笑',
	innocent: '无辜',
	smiling_imp: '小鬼',
	wink: '眨眼',
	blush: '脸红',
	yum: '美味',
	relieved: '放心',
	heart_eyes: '桃心',
	sunglasses: '得意',
	smirk: '假笑',
	neutral_face: '平静',
	expressionless: '呆板',
	unamused: '斜视',
	sweat: '流汗',
	pensive: '忧郁',
	confused: '困惑',
	confounded: '苦恼',
	sleeping: '睡觉',
	kissing_heart: '飞吻',
	kissing_smiling_eyes: '亲亲',
	stuck_out_tongue: '调皮',
	stuck_out_tongue_winking_eye: '惊吓',
	stuck_out_tongue_closed_eyes: '顽皮',
	disappointed: '沮丧',
	worried: '担心',
	angry: '生气',
	rage: '愤怒',
	cry: '流泪',
	triumph: '露齿',
	disappointed_relieved: '尴尬',
	grimacing: '惊恐',
	sob: '哭诉',
	scream: '尖叫',
	astonished: '吃惊',
	flushed: '瞪眼',
	mask: '口罩',
	slightly_smiling_face: '微笑',
	slightly_frowning_face: '难过',
	face_with_rolling_eyes: '对眼',
	relaxed: '放松',
	fist: '拳头',
	v: '比耶'
};
var emojiCNMap = {
	'太阳': 'sunny',
	'云朵': 'cloud',
	'小鸡': 'chicken',
	'瓢虫': 'beetle',
	'OK': 'ok_hand',
	'点赞': '+1',
	'倒赞': '-1',
	'鼓掌': 'clap',
	'轻笑': 'grinning',
	'眯眼': 'grin',
	'笑哭': 'joy',
	'开心': 'smiley',
	'眯笑': 'smile',
	'汗颜': 'sweat_smile',
	'可笑': 'laughing',
	'无辜': 'innocent',
	'小鬼': 'smiling_imp',
	'眨眼': 'wink',
	'脸红': 'blush',
	'美味': 'yum',
	'放心': 'relieved',
	'桃心': 'heart_eyes',
	'得意': 'sunglasses',
	'假笑': 'smirk',
	'平静': 'neutral_face',
	'呆板': 'expressionless',
	'斜视': 'unamused',
	'流汗': 'sweat',
	'忧郁': 'pensive',
	'困惑': 'confused',
	'苦恼': 'confounded',
	'睡觉': 'sleeping',
	'飞吻': 'kissing_heart',
	'亲亲': 'kissing_smiling_eyes',
	'调皮': 'stuck_out_tongue',
	'惊吓': 'stuck_out_tongue_winking_eye',
	'顽皮': 'stuck_out_tongue_closed_eyes',
	'沮丧': 'disappointed',
	'担心': 'worried',
	'生气': 'angry',
	'愤怒': 'rage',
	'流泪': 'cry',
	'露齿': 'triumph',
	'尴尬': 'disappointed_relieved',
	'惊恐': 'grimacing',
	'哭诉': 'sob',
	'尖叫': 'scream',
	'吃惊': 'astonished',
	'瞪眼': 'flushed',
	'口罩': 'mask',
	'微笑': 'slightly_smiling_face',
	'难过': 'slightly_frowning_face',
	'对眼': 'face_with_rolling_eyes',
	'放松': 'relaxed',
	'拳头': 'fist',
	'比耶': 'v'
}
export default EmojiUtil = {
	getEmojiCN(key) {
		return emojimap[key];
	},
	setEmojiCN(key, value) {
		emojimap[key] = value;
	},
	getEmojiName(key) {
		let result = '';
		if (emojiCNMap[key]) {
			result = emojiCNMap[key];
		} else {
			result = 'isNotExit';
		}
		return result;
	}
}