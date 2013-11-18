'use strict';

(function (cpu) {
	var ANSWER_COUNT = 4,
		ivs = [],
		checkAnswer = null,
		res = [],		//auto

	intervalId = setInterval(function () {
		if ($) {
			clearInterval(intervalId);
			init();
		}
	}, 200),

	init = function () {
		var goInputValue = function (fn) {
				var n = $('#num').val();
				$('#num').val('');
				if ((n == null) || (n.length != ANSWER_COUNT) || (isNaN(n))) {
					return;
				}
				for (var i = 0; i < 10; i++) {
					if (n.split(i + "").length > 2) { 
						return;
					}
				}
				fn(n);
			},
			goCpu = function (fn) {
				fn(cpu({
					get: function (id) {
						var iv;
						if (ivs.length == 0) {
							return null;
						} else if (id == null) {
							iv = ivs[ivs.length - 1];
						} else {
							iv = ivs[id];
						}
						return {
							num: iv.num,
							hit: iv.hit,
							blow: iv.blow
						};
					},
					length: ivs.length,
					ANSWER_COUNT: ANSWER_COUNT
				}));
			},
			createForm = function (o, id, t, v, w, evtyp, ev) {
				$(o).attr('id', id).attr('type', t)
					.val(v).css('width', w)
					.bind(evtyp, ev).appendTo('#hnb');
			};

		$('<form></form>').attr('id', 'hnb').appendTo('body');
		$('<div></div>').attr('id', 'msg')
			.css('color', 'red').css('fontweight', 'bold')
			.text('').appendTo('body');
		$('<table></table>').attr('id', 'tbl').appendTo('body');

		createForm('<input>', "num", "text", "", "40px", "keypress",
			function (event) {
				var code = event.keyCode;
				if ((0x30 <= code) && (code <= 0x39)) {
					return;
				} else if ((code == 0x0a) || (code == 0x0d)) {
					goInputValue(go);
				}
				event.preventDefault();
			}
		);

		createForm('<input>', "btn", "button", "go!", "35px", "click",
			function () {goInputValue(go);});
		createForm('<input>', "cpu", "button", "cpu", "35px", "click",
			function () {goCpu(go);});

		createForm('<input>', "auto", "button", "auto", "35px", "click",
			function () {
				var LOOP = 100,
					count = 0,
					r = {};
				res = [];
				while (res.length < LOOP) {
					goCpu(goa);
				}
				for (var i = 0; i < LOOP; i++) {
					count += res[i];
				}
				Tjs.print("avr: " + (count / LOOP));
				res.forEach(function (c) {
					r[c] == null ? r[c] = 1 : r[c]++;
				});
				for (var i = 1; i < 16; i++) {
					Tjs.print(i + ": " + (r[i] != null ? r[i] : "0"));
				}
			}
		);		//auto

		["click", "focus", "load"].forEach(function (e) {
			$('html').bind(e, function (event) { $('#num').focus(); });});
		$('#num').focus();

		start();
	},

	start = function () {
		ivs = [];
		checkAnswer = (function () {
			var ansNum = (function () {
				var ans = [],
					ary = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
				for (var i = 0; i < ANSWER_COUNT; i++) {
		 			for (var num = 0;
		 				num < Math.floor(Math.random() * ary.length); num++) {
						ary.push(ary.shift());
					}
					ans.push(ary.shift());
				}
				return ans;
			})();

			return function (iv) {
				iv.num.split("").forEach(function (ivVal, ivPos) {
					if (ivVal == ansNum[ivPos]) {
						iv.hit++;
					}
					ansNum.forEach(function (ansVal, ansPos) {
						if ((ivVal == ansVal) && (ivPos != ansPos)) {
							iv.blow++;
						}
					});
				});
				return (iv.hit == ANSWER_COUNT);
			};
		})();
	},

	go = function (n) {
		var count = ivs.length + 1,
			iv = {
				num: n,
				hit: 0,
				blow: 0
			};

		if (count == 1) {
			$('#tbl').html('');
			$('#msg').text('');
		}

		ivs.push(iv);

		if (checkAnswer(iv)) {
			$('#msg').text("Congratulations!!!");
			start();
		}

		$('<tr></tr>')
			.append($('<td>' + count + ": " + '</td>'))
				.css('text-align', 'right')
			.append($('<td>' + iv.num + '</td>')
				.css('text-align', 'center')
				.css('fontWeight', 'bold'))
			.append($('<td>' + iv.hit + "H" +'</td>')
				.css('text-align', 'center')
				.css('color', 'red'))
			.append($('<td>' + iv.blow + "B" + '</td>')
				.css('text-align', 'center')
				.css('color', 'blue'))
		.prependTo($('#tbl'));
	},

	goa = function (n) {
		var count = ivs.length + 1,
			iv = {
				num: n,
				hit: 0,
				blow: 0
			};

		ivs.push(iv);

		if (checkAnswer(iv)) {
			res.push(ivs.length);
			start();
		}
	};		//auto
})(
(function () {
	var candidates,
		candidatesInitLength = 0,
		tmpCandidatesLength;

	return function (ivsa) {
		var tmpCandidates = Object.create(null),
			maxs = [],
			fn = function (max) {return max.score;};

		if (ivsa.length == 0) {
			candidates = (function () {
				var cdd = Object.create(null),
					p = Math.pow(10, ivsa.ANSWER_COUNT),
					s = "";
				for (var i = p; i < p * 2; i++) {
					s = (i + "").slice(1, ivsa.ANSWER_COUNT + 1);
					if ((function () {
						for (var i = 0; i < 10; i++) {
							if (s.split(i + "").length > 2) { 
								return false;
							}
						}
						return true;
					})()) {
						cdd[s] = 1;
					}
				}
				return cdd;
			})();
			candidatesInitLength = Object.keys(candidates).length;
		}

		(function () {
			var del = [],
				iv = {},
				loop = function (fn) {
					iv.num.split("").forEach(function (n, ii) {
						for (var cd in candidates) {
							fn(n, ii, cd);
						}
					});
				};

			for (var i = 0; i < ivsa.length; i++) {
				iv = ivsa.get(i);

				if (iv.hit + iv.blow == 0) {
					loop(function (n, ii, cd) {
						cd.split("").forEach(function (c) {
							if (c == n) {
								del.push(cd);
							}
						});
					});
				} else if (iv.hit + iv.blow == ivsa.ANSWER_COUNT) {
					loop(function (n, ii, cd) {
						var ok = false;
						cd.split("").forEach(function (c) {
							if (c == n) {
								ok = true;
							}
						});
						if (! ok) {
							del.push(cd);
						}
					});
				} else {
					for (var cd in candidates) {
						(function () {
							var count = 0,
								h = 0,
								b = 0;
							cd.split("").forEach(function (c, ia) {
								iv.num.split("").forEach(function (n, ii) {
									if (c == n) {
										count++;
										(ia == ii) ? h++ : b++;
									}
								});
							});
							if ((count != iv.hit + iv.blow) ||
								((h != iv.hit) && (b != iv.blow))) {
								del.push(cd);
							}
						})();
					}
				}

				(function () {
					var f = (function () {
						if ((iv.hit == 0) && (iv.blow >= 1)) {
							return function (ii, ia) {return (ii == ia)};
						} else if ((iv.hit >= 1) && (iv.blow == 0)) {
							return function (ii, ia) {return (ii != ia)};
						} else {
							return null;
						}
					})();
					if (f != null) {
						loop(function (n, ii, cd) {
							cd.split("").forEach(function (c, ia) {
								if ((c == n) && f(ii, ia)) {
									del.push(cd);
								}
							});
						});
					}
				})();
			}

			ivsa.get() != null ? del.push(ivsa.get().num) : null;
			del.forEach(function (d) {
				candidates[d] = 0;
			});
			tmpCandidatesLength -= del.length;
		})();

		maxs = (function () {
			var maxs = [];
			((function () {
				var posObj = {},
					numCount = [];
				for (var i = 0; i < ivsa.ANSWER_COUNT; i++) {
					posObj = {"0": 0, "1": 0, "2": 0, "3": 0, "4": 0,
							"5": 0, "6": 0, "7": 0, "8": 0, "9": 0};
					for (var candidateNum in candidates) {
						if (candidates[candidateNum] != 0) {
							posObj[candidateNum.charAt(i)]++;
						}
					}
					numCount.push(posObj);
				}
				return numCount;
			})()).forEach(function (posObj, posIndex) {
				var maxCnt = 0;
				for (var i = 0; i < 10; i++) {
					if (posObj[i + ""] >= maxCnt) {
						maxCnt = posObj[i + ""];
						maxs.push({
							index: posIndex,
							val: i + "",
							score: posObj[i + ""]
						});
					}
				}
			});
			return maxs;
		})()
		
		var iv = ivsa.get(ivsa.length - 1);
		if ((maxs.length == 0) || (ivsa.length == 0)) {
			tmpCandidates = candidates;
		} else if ((iv.hit >= ivsa.ANSWER_COUNT - 2) &&
					(iv.hit + iv.blow != ivsa.ANSWER_COUNT) &&
					(candidatesInitLength / 300 < tmpCandidatesLength)) {
			for (var candidateNum in candidates) {
				tmpCandidates[candidateNum] = (candidates[candidateNum] == 0) ? 1 : 0;
			}
		} else if ((iv.blow == ivsa.ANSWER_COUNT - 1) &&
					(iv.hit + iv.blow != ivsa.ANSWER_COUNT) &&
					(candidatesInitLength / 3 < tmpCandidatesLength)) {
			for (var candidateNum in candidates) {
				tmpCandidates[candidateNum] = (candidates[candidateNum] == 0) ? 1 : 0;
			}
		} else if ((iv.hit + iv.blow == ivsa.ANSWER_COUNT - 1) &&
					(iv.hit + iv.blow != ivsa.ANSWER_COUNT) &&
					(candidatesInitLength / 2 < tmpCandidatesLength)) {
			for (var candidateNum in candidates) {
				tmpCandidates[candidateNum] = (candidates[candidateNum] == 0) ? 1 : 0;
			}
		} else if ((iv.hit <= 1) &&
					(iv.blow <= 2) &&
					(iv.hit + iv.blow >= 2) &&
					(candidatesInitLength / 100 < tmpCandidatesLength)) {
			for (var candidateNum in candidates) {
				tmpCandidates[candidateNum] = 1;
			}
		} else {
			fn = (function () {
				var x = 0;
				if (iv.hit + iv.blow == ivsa.ANSWER_COUNT) {
					x = 2.5;
				} else if (tmpCandidatesLength > candidatesInitLength / 10) {
					x = 1.4;
				} else if (tmpCandidatesLength > candidatesInitLength / 100) {
					x = 1.7;
				} else if (tmpCandidatesLength > candidatesInitLength / 210) {
					x = 1.9;
				} else if (tmpCandidatesLength > candidatesInitLength / 500) {
					x = 2.3;
				} else if (tmpCandidatesLength > candidatesInitLength / 2000) {
					x = 1.8;
				} else {
					x = 1.3;
				}
				if (x == 0) {
					return function (max) {return max.score;};
				} else {
					return function (max) {
						return Math.floor(Math.pow(max.score, x));};
				}
			})();
			maxs.forEach(function (max, i, maxs) {
				for (var candidateNum in candidates) {
					if (candidates[candidateNum] != 0) {
						if (max.val == candidateNum.charAt(max.index)) {
							tmpCandidates[candidateNum] = fn(max);
						}
					}
				}
			});
		}

		return (function () {
			var rndcount = Math.floor(Math.random() * (function () {
					var total = 0;
//var len = Object.keys(tmpCandidates).length;
					for (var candidateNum in tmpCandidates) {
//if (len < 50) {
//Tjs.print(candidateNum + ":" + tmpCandidates[candidateNum]);
//}
						total += tmpCandidates[candidateNum];
					}
					return total;
				})());
//Tjs.print("length : " + Object.keys(tmpCandidates).length);
			for (var candidateNum in tmpCandidates) {
				rndcount -= tmpCandidates[candidateNum];
				if (rndcount <= 0) {
					return candidateNum;
				}
			}
		})();
	};
})());