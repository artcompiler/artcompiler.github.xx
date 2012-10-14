CodeMirror.defineMode("graffiti", function() {

    function assert(b, str) {
        if (!b) {
            alert(str)
        }
    }

    function print(str) {
	console.log(str)
    }


    var TK_IDENT  = 0x01
    var TK_NUM    = 0x02
    var TK_DOT    = 0x03
    var TK_EQUAL  = 0x04
    var TK_IF     = 0x05
    var TK_THEN   = 0x06
    var TK_ELSE   = 0x07
    var TK_RETURN = 0x08
    var TK_IS     = 0x09
    var TK_POSTOP = 0x0A
    var TK_PREOP  = 0x0B
    var TK_FUN    = 0x0C
    var TK_VAL    = 0x0D
    var TK_BINOP  = 0x0E
    var TK_CASE   = 0x0F
    var TK_OF     = 0x10
    var TK_END    = 0x11

    var globalLexicon = {
        "fun" : { tk: TK_FUN, cls: "keyword" },
        "val" : { tk: TK_VAL, cls: "keyword" },
        "if" : { tk: TK_IF, cls: "keyword" },
        "case" : { tk: TK_CASE, cls: "keyword" },
        "then" : { tk: TK_THEN, cls: "keyword" },
        "else" : { tk: TK_ELSE, cls: "keyword" },
	"is" : { tk: TK_IS, cls: "keyword", length: 0 },
	"of" : { tk: TK_OF, cls: "keyword", length: 0 },
	"end" : { tk: TK_END, cls: "keyword", length: 0 },

	"zero" : { tk: TK_NUM, cls: "number", length: 0 },
	"one" : { tk: TK_NUM, cls: "number", length: 0 },
	"two" : { tk: TK_NUM, cls: "number", length: 0 },
	"three" : { tk: TK_NUM, cls: "number", length: 0 },
	"four" : { tk: TK_NUM, cls: "number", length: 0 },
	"five" : { tk: TK_NUM, cls: "number", length: 0 },
	"six" : { tk: TK_NUM, cls: "number", length: 0 },
	"seven" : { tk: TK_NUM, cls: "number", length: 0 },
	"eight" : { tk: TK_NUM, cls: "number", length: 0 },
	"nine" : { tk: TK_NUM, cls: "number", length: 0 },
	"ten" : { tk: TK_NUM, cls: "number", length: 0 },

	"print" : { tk: TK_IDENT, cls: "method", length: 1 },


	// bitzee
	"start" : { tk: TK_IDENT, cls: "handler", length: 0 },
	"remote" : { tk: TK_IDENT, cls: "handler", length: 1 },
	"forward" : { tk: TK_IDENT, cls: "method", length: 1 },
	"backward" : { tk: TK_IDENT, cls: "method", length: 1 },
	"stop" : { tk: TK_IDENT, cls: "method", length: 1 },
	"spin" : { tk: TK_IDENT, cls: "method", length: 1 },
	"play" : { tk: TK_NUM, cls: "number", length: 0 },
	"slow" : { tk: TK_NUM, cls: "number", length: 0 },
	"seconds" : { tk: TK_POSTOP, cls: "operator", length: 0 },
	"ms" : { tk: TK_POSTOP, cls: "operator", length: 0 },
	"not" : { tk: TK_PREOP, cls: "operator", length: 0 },
	"minus" : { tk: TK_BINOP, cls: "operator", length: 0 },
	"blink" : { tk: TK_IDENT, cls: "method", length: 4 },
	"left" : { tk: TK_IDENT, cls: "val", length: 0 },
	"right" : { tk: TK_IDENT, cls: "val", length: 0 },
	"speed" : { tk: TK_IDENT, cls: "method", length: 1 },
	"full" : { tk: TK_IDENT, cls: "val", length: 0 },
	"half" : { tk: TK_IDENT, cls: "val", length: 0 },
	"none" : { tk: TK_IDENT, cls: "val", length: 0 },
	"high" : { tk: TK_IDENT, cls: "val", length: 0 },
	"low" : { tk: TK_IDENT, cls: "val", length: 0 },
	"on" : { tk: TK_IDENT, cls: "val", length: 0 },
	"off" : { tk: TK_IDENT, cls: "val", length: 0 },
	"delay" : { tk: TK_IDENT, cls: "method", length: 1 },
	"random" : { tk: TK_IDENT, cls: "method", length: 2 },
    }

    function findWord(ctx, lexeme) {
	print("findWord() lexeme=" + lexeme)
	for (var i = ctx.state.env.length-1; i >= 0; i--) {
	    var word = ctx.state.env[i].lexicon[lexeme]
	    if (word) {
		return word
	    }
	}
	return null
    }

    function addWord(ctx, lexeme, entry) {
	print("addWord() lexeme=" + lexeme)
	topEnv(ctx).lexicon[lexeme] = entry
	return null
    }

    function enterFun(ctx, name) {
	ctx.state.env.push({name: name, lexicon: []})
    }

    function exitFun(ctx) {
	ctx.state.env.pop()
    }


    function eat(ctx, tk) {
        if (next(ctx) !== tk) {
            throw "syntax error"
	}
	print("eat() lexeme="+lexeme)
	return findWord(ctx, lexeme)
    }
    
    function match(ctx, tk) {
        if (peek(ctx) === tk) {
            return true
	}
	else {
//	    ctx.scan.stream.backUp(lexeme.length)
	    return false
	}
    }

    function next(ctx) {
	var tk = ctx.scan.start()
	print("next() tk="+tk+" lexeme="+lexeme)
	return tk
    }

    function peek(ctx) {
	var tk = ctx.scan.start()
	print("peek() tk="+tk+" lexeme="+lexeme)
	if (tk) {
	    ctx.scan.stream.backUp(lexeme.length)
	}
	return tk
    }

    // Parsing functions

    function number(ctx, cc) {
	print("number()")
	eat(ctx, TK_NUM)
	cc.cls = "number"
	return cc
    }

    function name(ctx, cc) {
	print("name()")
        eat(ctx, TK_IDENT)
	var word = findWord(ctx, lexeme)
	if (word) {
            cc.cls = word.cls
	}
	else {
	    cc.cls = "comment"
	}
	assert(cc, "name")
        return cc
    }

    function primaryExpr(ctx, cc) {
	print("primaryExpr()")
	if (match(ctx, TK_NUM)) {
	    return number(ctx, cc)
	}
	return name(ctx, cc)
    }

    function callExpr(ctx, cc) {
	print("callExpr()")
	return primaryExpr(ctx, function (ctx) {
	    var tk = findWord(ctx, lexeme)
	    if (tk && tk.cls === "method") {
		startArgs(ctx, tk.length)
		if (ctx.state.argc === 0) {
		    finishArgs(ctx)
		    return cc
		}
		return arg(ctx, function (ctx) {
		    return args(ctx, cc)
		})
	    }
	    return cc
	})
    }

    function postfixExpr(ctx, cc) {
	print("postfixExpr()")
	var ret = callExpr(ctx, function (ctx) {
	    print("looking for 'seconds'")
	    if (match(ctx, TK_POSTOP)) {
		eat(ctx, TK_POSTOP)
		cc.cls = "operator"
	    }
	    return cc
	})
	return ret
    }
    
    function prefixExpr(ctx, cc) {
	print("prefixExpr()")
	var ret
	ret = postfixExpr(ctx, cc)
	return ret
    }
    
    function startArgs(ctx, len) {
	print("beginArgs() argc="+len)
	ctx.state.argcStack.push(ctx.state.argc)
	ctx.state.argc = len
    }

    function finishArgs(ctx) {
	ctx.state.argc = ctx.state.argcStack.pop()
	print("finishArgs() argc="+ctx.state.argc)
    }
 
    function args(ctx, cc) {
	print("args()")
	if (ctx.state.argc === 0) {
	    finishArgs(ctx)
	    return cc
	}
        return function (ctx) {
	    var ret = arg(ctx, function (ctx) {
		return args(ctx, cc)
	    })
	    ret.cls = "val"
            return ret
        }
    }

    function arg(ctx, cc) {
	print("arg()")
	ctx.state.argc--
	return isExpr(ctx, cc)
    }

    function binaryExpr(ctx, cc) {
	print("binaryExpr()")
	return prefixExpr(ctx, function (ctx) {
	    if (match(ctx, TK_BINOP)) {
		eat(ctx, TK_BINOP)
		var ret = function (ctx) {
		    return binaryExpr(ctx, cc)
		}
		ret.cls = "operator"
		return ret
	    }
	    return cc
	})
    }
    
    function isExpr(ctx, cc) {
	print("isExpr()")
	return binaryExpr(ctx, function (ctx) {
	    if (match(ctx, TK_IS)) {
		eat(ctx, TK_IS)
		var ret = function (ctx) {
		    return isExpr(ctx, cc)
		}
		ret.cls = "operator"
		return ret
	    }
	    return cc
	})
    }
    
    function expr(ctx, cc) {
	print("expr()")
	if (match(ctx, TK_IF) || match(ctx, TK_CASE)) {
	    return condExpr(ctx, cc)
	}
	return isExpr(ctx, cc)
    }

    function stmts(ctx, cc) {
	print("stmts()")
	if (match(ctx, TK_DOT)) {
	    eat(ctx, TK_DOT)
	    cc.cls = "punc"
	    return cc
	}
        return stmt(ctx, function (ctx) {
            return stmts(ctx, cc)
        })
    }

    function stmt(ctx, cc) {
	print("stmt()")
        if (match(ctx, TK_VAL)) {
	    return valDefn(ctx, cc)
        }
	else {
	    return exprStmt(ctx, cc)
	}
    }

    function exprStmt(ctx, cc) {
	return expr(ctx, function (ctx) {
	    eat(ctx, TK_DOT)
	    cc.cls = "punc"
	    return cc
	})
    }

    function condExpr(ctx, cc) {
	print("condExpr()")
	if (match(ctx, TK_IF)) {
	    eat(ctx, TK_IF)
            var ret = function (ctx) {
		return expr(ctx, function (ctx) {
		    print("ifStmt() looking for then")
                    return thenClause(ctx, cc)
		})
            }
	    return ret
	}

	eat(ctx, TK_CASE)
        var ret = function (ctx) {
	    return expr(ctx, function (ctx) {
		eat(ctx, TK_OF)
		var ret = function (ctx) {
		    return matchesClause(ctx, cc)
		}
		ret.cls = "keyword"
		return ret
	    })
        }
        ret.cls = "keyword"
        return ret
    }


    function matchesClause(ctx, cc) {
	print("matchesClause()")
        return matchClause(ctx, function (ctx) {
	    if (match(ctx, TK_END)) {
		eat(ctx, TK_END)
		var ret = function (ctx) {
		    return cc
		}
		ret.cls = "keyword"
		return ret
	    }
	    return matchesClause(ctx, cc)
	})
    }

    function matchClause (ctx, cc) {
	return pattern(ctx, function (ctx) {
	    eat(ctx, TK_EQUAL)
	    var ret = function (ctx) {
		return expr(ctx, function (ctx) {
		    eat(ctx, TK_DOT)
		    cc.cls = "punc"
		    return cc
		})
	    }
	    ret.cls = "punc"
	    return ret
	})
    }

    function pattern(ctx, cc) {
	// FIXME only matches number literals for now
	eat(ctx, TK_NUM)
	cc.cls = "number"
	return cc
    }

    function thenClause(ctx, cc) {
	print("thenClause()")
        eat(ctx, TK_THEN)
        var ret = function (ctx) {
            return stmt(ctx, function (ctx) {
		if (match(ctx, TK_ELSE)) {
                    return elseClause(ctx, cc)
		}
		else {
		    return cc
		}
            })
        }
        ret.cls = "keyword"
        return ret
    }

    function elseClause(ctx, cc) {
	print("elseClause()")
        eat(ctx, TK_ELSE)
        var ret = function (ctx) {
            return stmt(ctx, cc)
        }
        ret.cls = "keyword"
        return ret
    }

    function returnStmt(ctx, cc) {
	print("returnStmt()")
        eat(ctx, TK_RETURN)
        var ret = function (ctx) {
            return expr(ctx, cc)
        }
        ret.cls = "keyword"
        return ret
    }

    function program(ctx, cc) {
	print("program()")
        return defs(ctx, cc)
    }

    function defs(ctx, cc) {
	print("defs()")
        return def(ctx, function (ctx) {
            return defs(ctx, cc)
        })
    }

    function def(ctx, cc) {
	print("def()")
	if (match(ctx, TK_FUN)) {
            eat(ctx, TK_FUN)
            var ret = function (ctx) {
		var ret = name(ctx, function (ctx) {
		    addWord(ctx, lexeme, { tk: TK_IDENT, cls: "method", length: 0 })
		    ctx.state.argc = 0
		    enterFun(ctx, lexeme)
                    return params(ctx, function (ctx) {
			print("def/params() argc="+ctx.state.argc)
			findWord(ctx, topEnv(ctx).name).length = ctx.state.argc
			return stmts(ctx, function (ctx) {
			    exitFun(ctx)
			    return cc
			})
		    })
		})
		ret.cls = "handler"
		return ret
            }
            ret.cls = "keyword"
	    return ret
	}
	else
	if (match(ctx, TK_VAL)) {
	    return valDefn(ctx, cc)
	}
        return name(ctx, cc)
    }

    function valDefn(ctx, cc) {
        eat(ctx, TK_VAL)
        var ret = function (ctx) {
	    var ret = name(ctx, function (ctx) {
		addWord(ctx, lexeme, { tk: TK_IDENT, cls: "val", length: 0 })
		eat(ctx, TK_EQUAL)
                var ret = function (ctx) {
		    return expr(ctx, function (ctx) {
			eat(ctx, TK_DOT)
			var ret = function (ctx) {
			    return cc
			}
			ret.cls = "punc"
			return ret
		    })
		}
		ret.cls = "punc"
		return ret
	    })
	    ret.cls = "handler"
	    return ret
        }
        ret.cls = "keyword"
	return ret
    }

    function params(ctx, cc) {
	print("params()")
        if (match(ctx, TK_EQUAL)) {
	    eat(ctx, TK_EQUAL)
            cc.cls = "punc"
            return cc
        }
        return function (ctx) {
	    var ret = primaryExpr(ctx, function (ctx) {
		ctx.state.argc++
		print("params/param() lexeme="+lexeme)
		addWord(ctx, lexeme, { tk: TK_IDENT, cls: "val" })
		return params(ctx, cc)
	    })
	    ret.cls = "val"
            return ret
        }
    }

    function param(ctx, cc) {
	print("param()")
        return primaryExpr(ctx, function (ctx) {
	    return cc
	})
    }


    // Drive the parser

    return {
        token: function(stream, state) {
            return parse(stream, state)
        },

        startState: function() {
            return {
                cc: program,   // top level parsing function
		argc: 0,
		argcStack: [0],
		env: [ {name: "global", lexicon: globalLexicon } ]
            }
        }
    }

    function topEnv(ctx) {
	return ctx.state.env[ctx.state.env.length-1]
    }

    function parse(stream, state) {
	var ctx = {scan: scanner(stream), state: state}
	var cls
        try {
            // call the continuation and store the next continuation
            var cc = state.cc = state.cc(ctx, function (ctx, cc) { print("dummy()") })
            cls = cc.cls
        }
        catch (x) {
            if (x === "syntax error") {
		cls = "comment"
            }
	    else {
		alert(x)
		throw x
		next(ctx)
		cls = "comment"
		
            }
        }
	print("parse() cls="+cls)
	print("parse() lexeme="+lexeme)
	print("parse() cc="+cc)
	print("parse() stream.pos="+ctx.scan.stream.pos)
	return cls
    }

    var lexeme = ""

    function scanner(stream) {

        var lexemeToToken = [ ]

        return {
            start: start ,
            stream: stream,
            lexeme: function () {
		return lexeme
	    }
         }

        // begin private functions

        function start () {
            var c;
            lexeme = "";
            while (stream.peek() !== void 0) {
                switch ((c = stream.next().charCodeAt(0))) {
                case 32:  // space
                case 9:   // tab
                case 10:  // new line
                case 13:  // carriage return
		case ','.charCodeAt(0):
		case '('.charCodeAt(0):
		case ')'.charCodeAt(0):
		    c = ' '
                    continue
                case 45:  // dash
                    lexeme += String.fromCharCode(c);
                    return TK_MINUS
                case 46:  // dot
                    lexeme += String.fromCharCode(c);
                    return TK_DOT
                case 61:  // equal
                    lexeme += String.fromCharCode(c);
                    return TK_EQUAL
                case 92:  // backslash
                    lexeme += String.fromCharCode(c);
                    return latex();
                case 40:  // left paren
                case 41:  // right paren
                case 42:  // asterisk
                case 43:  // plus
                case 44:  // comma
                case 47:  // slash
                case 91:  // left bracket
                case 93:  // right bracket
                case 94:  // caret
                case 123: // left brace
                case 125: // right brace
                    lexeme += String.fromCharCode(c);
                    return c; // char code is the token id
                default:
                    if ((c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0)) ||
                        (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0))) {
                        return ident(c);
                    }
                    else if (c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0)) {
                        //lex += String.fromCharCode(c);
                        //c = src.charCodeAt(curIndex++);
                        //return TK_NUM;
                        return number(c);
                    }
                    else {
                        assert( false, "scan.start(): c="+c);
                        return 0;
                    }
                }
            }

            return 0;
        }
        
        function number(c) {
            while (c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0)) {
                lexeme += String.fromCharCode(c);
                var s;
                c = (s = stream.next()) ? s.charCodeAt(0) : 0
            }

            if (c) {
                stream.backUp(1);
            }  // otherwise, we are at the end of stream
            return TK_NUM;
        }
        
        function ident(c) {
            while ((c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0)) ||
                   (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0))) {
                lexeme += String.fromCharCode(c);                
                c = stream.peek() ? stream.next().charCodeAt(0) : 0
            }
        
            if (c) {
                stream.backUp(1);
            }  // otherwise, we are at the end of stream

	    print("ident() lexeme="+lexeme)
            var tk = TK_IDENT
	    if (globalLexicon[lexeme]) {
		tk = globalLexicon[lexeme].tk
	    }
            return tk;
	}
    }
})

CodeMirror.defineMIME("text", "graffiti")


