CodeMirror.defineMode("graffiti", function() {

    function assert(b, str) {
        if (!b) {
            alert(str)
        }
    }

    function print(str) {
	//console.log(str)
    }


    var TK_IDENT  = 0x01
    var TK_NUM    = 0x02
    var TK_DOT    = 0x03
    var TK_ON     = 0x04
    var TK_IF     = 0x05
    var TK_THEN   = 0x06
    var TK_ELSE   = 0x07
    var TK_RETURN = 0x08
    var TK_IS     = 0x09

    var lexicon = {
        "on" : { tk: TK_ON, cls: "keyword" },
        "if" : { tk: TK_IF, cls: "keyword" },
        "then" : { tk: TK_THEN, cls: "keyword" },
        "else" : { tk: TK_ELSE, cls: "keyword" },
        "return" : { tk: TK_RETURN, cls: "keyword" },
	"draw" : { tk: TK_IDENT, cls: "method", length: 5 },
	"triangle" : { tk: TK_IDENT, cls: "method", length: 3 },
	"setup" : { tk: TK_IDENT, cls: "handler", length: 0 },
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
	"is" : { tk: TK_IS, cls: "keyword", length: 0 },
	// bitzee
	"start" : { tk: TK_IDENT, cls: "handler", length: 0 },
	"irrecv" : { tk: TK_IDENT, cls: "handler", length: 1 },
	"forward" : { tk: TK_IDENT, cls: "method", length: 1 },
	"backward" : { tk: TK_IDENT, cls: "method", length: 1 },
	"spin" : { tk: TK_IDENT, cls: "method", length: 1 },
	"forwardleft" : { tk: TK_IDENT, cls: "method", length: 1 },
	"forwardright" : { tk: TK_IDENT, cls: "method", length: 1 },
	"play" : { tk: TK_NUM, cls: "number", length: 0 },
	"slow" : { tk: TK_NUM, cls: "number", length: 0 },
    }

    function eat(ctx, tk) {
        if (next(ctx) !== tk) {
            throw "syntax error"
	}
	print("eat() lexeme="+lexeme)
	return lexicon[lexeme]
    }
    
    function match(ctx, tk) {
        if (peek(ctx) === tk) {
            return true
	}
	else {
//	    ctx.scan.stream.backUp(lexeme.length)
// 	    nextToken = null
	    return false
	}
    }

    var nextToken;

    function next(ctx) {
	if (nextToken) {
	    var tk = nextToken
	    nextToken = null
	    return tk
	}
	nextToken = ctx.scan.start()
	print("next() nextToken="+nextToken+" lexeme="+lexeme)
	return nextToken
    }

    function peek(ctx) {
	if (nextToken) {
	    return nextToken
	}
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
        var tk = eat(ctx, TK_IDENT)
	if (tk) {
	    print(tk.cls)
            cc.cls = tk.cls
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
	    var tk = lexicon[lexeme]
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
        return arg(ctx, function (ctx) {
            return args(ctx, cc)
        })
    }

    function arg(ctx, cc) {
	print("arg()")
	ctx.state.argc--
	return isExpr(ctx, cc)
    }

    function isExpr(ctx, cc) {
	print("isExpr()")
	return callExpr(ctx, function (ctx) {
	    print("isExpr() callExpr()")
	    match(ctx, TK_IS)
/*
	    if (match(ctx, TK_IS)) {
		eat(ctx, TK_IS)
		var ret = function (ctx) {
		    return isExpr(ctx, cc)
		}
		ret.cls = "keyword"
		return ret
	    }
*/
	    return cc
	})
    }
    
    function expr(ctx, cc) {
	print("expr()")
	return isExpr(ctx, cc)
    }

    function stmts(ctx, cc) {
	print("stmts()")
	if (match(ctx, TK_ON)) {
	    return cc
	}
        return stmt(ctx, function (ctx) {
            return stmts(ctx, cc)
        })
    }

    function stmt(ctx, cc) {
	print("stmt()")
	if (match(ctx, TK_IF)) {
	    return ifStmt(ctx, cc)
	}
	else
	if (match(ctx, TK_RETURN)) {
	    return returnStmt(ctx, cc)
	}
	else {
	    return exprStmt(ctx, cc)
	}
    }

    function exprStmt(ctx, cc) {
	return callExpr(ctx, function (ctx) {
	    eat(ctx, TK_DOT)
	    cc.cls = "punc"
	    return cc
	})
    }

    function ifStmt(ctx, cc) {
	print("ifStmt()")
        eat(ctx, TK_IF)
        var ret = function (ctx) {
            return expr(ctx, function (ctx) {
		print("ifStmt() looking for then")
                return thenClause(ctx, cc)
            })
        }
        ret.cls = "keyword"
        return ret
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
        eat(ctx, TK_ON)
         var ret = function (ctx) {
            return name(ctx, function (ctx) {
                return params(ctx, function (ctx) {
		    return stmts(ctx, cc)
		})
            })
        }
        ret.cls = "keyword"
        return ret
    }

    function params(ctx, cc) {
	print("params()")
        if (match(ctx, TK_DOT)) {
	    eat(ctx, TK_DOT)
            cc.cls = "punc"
            return cc
        }
        return param(ctx, function (ctx) {
            return params(ctx, cc)
        })
        return ret
    }

    function param(ctx, cc) {
	print("param()")
        return name(ctx, cc)
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
		argcStack: [0]
            }
        }
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
                case 46:  // dot
                    lexeme += String.fromCharCode(c);
                    return TK_DOT
                case 92:  // backslash
                    lexeme += String.fromCharCode(c);
                    return latex();
                case 40:  // left paren
                case 41:  // right paren
                case 42:  // asterisk
                case 43:  // plus
                case 44:  // comma
                case 45:  // dash
                case 47:  // slash
                case 61:  // equal
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
            var entry = lexicon[lexeme]
            var tk = TK_IDENT
            if (entry) {
                tk = entry.tk
            }
            return tk;
        }
        
    }

})

CodeMirror.defineMIME("text", "graffiti")


/*

    function unaryExpr(ctx, cc) {
	var t;
	var expr;
	switch (t = next(ctx)) {
	case TK_ADD:
	    expr = unaryExpr(ctx, cc);
	    break;
	case TK_SUB:
	    expr = negate(unaryExpr(ctx, cc));
	    break;
	default:
	    expr = primaryExpr(ctx, cc);
	    break;
	}
	return expr;
    }
    
    function exponentialExpr(ctx, cc) {
	var expr = unaryExpr(ctx, cc);
	var t;
	while ((t=next(hd())===TK_CARET) {
	    next();
	    var expr2 = unaryExpr();
	    if (expr2===1) {
		expr = expr;
	    }
	    else if (expr2===0) {
		expr = 1;
	    }
	    else {
		expr = {op: tokenToOperator[t], args: [expr, expr2]};
	    }
	}
	
	return expr;
    }
    
    function multiplicativeExpr() {
	var expr = exponentialExpr();
	var t;
	
	while((t=hd())===TK_VAR || t===TK_LEFTPAREN) {
	    var expr2 = exponentialExpr();
	    if (expr2 === 1) {
		expr = expr;
	    }
	    else if (expr === 1) {
		expr = expr2;
	    }
	    else {
		expr = {op: OpStr.MUL, args: [expr, expr2]};
	    }
	}
	
	while (isMultiplicative(t = hd())) {
	    next();
	    var expr2 = exponentialExpr();
	    if (expr2===1) {
		expr = expr;
	    }
	    else if (t===TK_MUL && expr===1) {
		expr = expr2;
	    }
	    else {
		expr = {op: tokenToOperator[t], args: [expr, expr2]};
	    }
	}
	return expr;
	
	function isMultiplicative(t) {
	    return t===TK_MUL || t===TK_DIV;
	}
    }
    
    function isNeg(n) {
	if (jQuery.type(n)==="number") {
	    return n < 0;
	}
	else if (n.args.length===1) {
	    return n.op===OpStr.SUB && n.args[0] > 0;  // is unary minus
	}
	else if (n.args.length===2) {
	    return n.op===OpStr.MUL && isNeg(n.args[0]);  // leading term is neg
	}
    }
    
    function negate(n) {
	if (jQuery.type(n)==="number") {
	    return -n;
	}
	else if (n.args.length===1 && n.op===OpStr.SUB) {
	    return n.args[0];  // strip the unary minus
	}
	else if (n.args.length===2 && n.op===OpStr.MUL && isNeg(n.args[0])) {
	    return {op: n.op, args: [negate(n.args[0]), n.args[1]]};
	}
	assert(false);
	return n;
	
    }
    
    function additiveExpr() {
	var expr = multiplicativeExpr();
	var t;
	while (isAdditive(t = hd())) {
	    next();
	    var expr2 = multiplicativeExpr();
	    if (t===TK_ADD && isNeg(expr2)) {
		t = TK_SUB;
		expr2 = negate(expr2);
	    }
	    expr = {op: tokenToOperator[t], args: [expr, expr2]};
	}
	return expr;
	
	function isAdditive(t) {
	    return t===TK_ADD || t===TK_SUB || t===TK_PM;
	}
    }
    
*/