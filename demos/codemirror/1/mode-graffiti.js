CodeMirror.defineMode("graffiti", function() {

    function assert(b, str) {
        if (!b) {
            alert(str)
        }
    }

    var TK_IDENT = 0x01
    var TK_NUM   = 0x02
    var TK_DOT   = 0x03
    var TK_ON    = 0x04
    var TK_IF    = 0x05
    var TK_THEN  = 0x06
    var TK_ELSE  = 0x07
    var TK_RETURN = 0x08

    var lexicon = {
        "on" : { tk: TK_ON, cls: "keyword" },
        "if" : { tk: TK_IF, cls: "keyword" },
        "then" : { tk: TK_THEN, cls: "keyword" },
        "else" : { tk: TK_ELSE, cls: "keyword" },
        "return" : { tk: TK_RETURN, cls: "keyword" }
    }

    function eat(ctx, tk) {
        if (next(ctx) !== tk) {
            throw "syntax error"
	}
    }

    function match(ctx, tk) {
        if (peek(ctx) === tk) {
            return true
	}
	else {
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
	return nextToken = ctx.scan.start()
    }

    function peek(ctx) {
	if (nextToken) {
	    return nextToken
	}
	return nextToken = ctx.scan.start()
    }

    // Parsing functions

    /*
      program -> defs
      defs -> def defs | empty
      def -> 'on' name params '.'
      name -> ident
      params -> params param
      param -> ident

      */

    function program(ctx, cc) {
	console.log("program()")
        return defs(ctx, cc)
    }

    function defs(ctx, cc) {
	console.log("defs()")
        return def(ctx, function (ctx) {
            return defs(ctx, cc)
        })
    }

    function def(ctx, cc) {
	console.log("def()")
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

    function stmts(ctx, cc) {
	console.log("stmts()")
        return stmt(ctx, function (ctx) {
	    if (match(ctx, TK_ON)) {
		return cc
	    }
            return stmts(ctx, cc)
        })
    }

    function stmt(ctx, cc) {
	console.log("stmt()")
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
	var ret = expr(ctx, cc)
	eat(ctx, TK_DOT)
        ret.cls = "punc"
    }

    function expr(ctx, cc) {
	console.log("expr()")
	return callExpr(ctx, cc)
    }

    function callExpr(ctx, cc) {
	console.log("callExpr()")
	return name(ctx, function (ctx) {
	    return args(ctx, cc)
	})
    }
 
    function args(ctx, cc) {
	console.log("args()")
        if (match(ctx, TK_DOT) || match(ctx, TK_ON)) {
            return cc
        }
        return expr(ctx, function (ctx) {
            return args(ctx, cc)
        })
        return ret
    }

    function param(ctx, cc) {
	console.log("param()")
        return ident(ctx, cc)
    }

    function ifStmt(ctx, cc) {
	console.log("ifStmt()")
        eat(ctx, TK_IF)
        var ret = function (ctx) {
            return expr(ctx, function (ctx) {
                return thenClause(ctx, cc)
            })
        }
        ret.cls = "keyword"
        return ret
    }

    function thenClause(ctx, cc) {
	console.log("thenClause()")
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
	console.log("elseClause()")
        eat(ctx, TK_ELSE)
        var ret = function (ctx) {
            return stmt(ctx, cc)
        }
        ret.cls = "keyword"
        return ret
    }

    function returnStmt(ctx, cc) {
	console.log("returnStmt()")
        eat(ctx, TK_RETURN)
        var ret = function (ctx) {
            return expr(ctx, cc)
        }
        ret.cls = "keyword"
        return ret
    }

    function name(ctx, cc) {
	console.log("name()")
        return ident(ctx, cc)
    }

    function ident(ctx, cc) {
	console.log("ident()")
        eat(ctx, TK_IDENT)
        cc.cls = "ident"
        return cc
    }

    function params(ctx, cc) {
	console.log("params()")
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
	console.log("param()")
        return ident(ctx, cc)
    }

    // Drive the parser

    return {
        token: function(stream, state) {
            return parse(stream, state)
        },

        startState: function() {
            return {
                cc: program   // top level parsing function
            }
        }
    }

    function parse(stream, state) {
	var ctx = {scan: scanner(stream)}
        try {
            // call the continuation and store the next continuation
            var cc = state.cc = state.cc(ctx, function (ctx, cc) { })
            return cc.cls
        }
        catch (x) {
	    if (x === "syntax error") {
		return "comment"
	    }
	    else {
		alert("x")
		next(ctx)
		return ""
	    }
        }
    }

    function scanner(stream) {

        var lexeme = "";
        var lexemeToToken = [ ];

        return {
            start: start ,
            stream: stream,
            lexeme : function () { return lexeme } ,
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
                    continue
                case 46:  // dot
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
                        //lexeme += String.fromCharCode(c);
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
            stream.backUp(1);
            
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

            var lex = lexicon[lexeme]
            var tk = TK_IDENT
            if (lex) {
                tk = lex.tk
            }
                        
            return tk;
        }
        
    }

})

CodeMirror.defineMIME("text", "graffiti")
