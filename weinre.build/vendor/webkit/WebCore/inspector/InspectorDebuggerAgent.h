/*
 * Copyright (C) 2010 Apple Inc. All rights reserved.
 * Copyright (C) 2010 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#ifndef InspectorDebuggerAgent_h
#define InspectorDebuggerAgent_h

#if ENABLE(JAVASCRIPT_DEBUGGER) && ENABLE(INSPECTOR)
#include "InjectedScript.h"
#include "ScriptBreakpoint.h"
#include "ScriptDebugListener.h"
#include "ScriptState.h"
#include <wtf/Forward.h>
#include <wtf/HashMap.h>
#include <wtf/PassOwnPtr.h>
#include <wtf/Vector.h>
#include <wtf/text/StringHash.h>

namespace WebCore {
class InjectedScriptHost;
class InspectorAgent;
class InspectorFrontend;
class InspectorObject;
class InspectorValue;

enum DebuggerEventType {
    JavaScriptPauseEventType,
    JavaScriptBreakpointEventType,
    NativeBreakpointDebuggerEventType
};

class InspectorDebuggerAgent : public ScriptDebugListener {
    WTF_MAKE_NONCOPYABLE(InspectorDebuggerAgent); WTF_MAKE_FAST_ALLOCATED;
public:
    static PassOwnPtr<InspectorDebuggerAgent> create(InspectorAgent*, InspectorFrontend*, bool eraseStickyBreakpoints);
    virtual ~InspectorDebuggerAgent();

    void inspectedURLChanged(const String& url);

    // Part of the protocol.
    void activateBreakpoints();
    void deactivateBreakpoints();

    void setJavaScriptBreakpoint(const String& url, int lineNumber, int columnNumber, const String& condition, bool enabled, String* breakpointId, RefPtr<InspectorArray>* locations);
    void setJavaScriptBreakpointBySourceId(const String& sourceId, int lineNumber, int columnNumber, const String& condition, bool enabled, String* breakpointId, int* actualLineNumber, int* actualColumnNumber);
    void removeJavaScriptBreakpoint(const String& breakpointId);
    void continueToLocation(const String& sourceId, int lineNumber, int columnNumber);

    void editScriptSource(const String& sourceID, const String& newContent, bool* success, String* result, RefPtr<InspectorValue>* newCallFrames);
    void getScriptSource(const String& sourceID, String* scriptSource);
    void schedulePauseOnNextStatement(DebuggerEventType type, PassRefPtr<InspectorValue> data);
    void cancelPauseOnNextStatement();
    void breakProgram(DebuggerEventType type, PassRefPtr<InspectorValue> data);
    void pause();
    void resume();
    void stepOver();
    void stepInto();
    void stepOut();
    void setPauseOnExceptionsState(long pauseState, long* newState);
    void evaluateOnCallFrame(PassRefPtr<InspectorObject> callFrameId, const String& expression, const String& objectGroup, bool includeCommandLineAPI, RefPtr<InspectorValue>* result);
    void getCompletionsOnCallFrame(PassRefPtr<InspectorObject> callFrameId, const String& expression, bool includeCommandLineAPI, RefPtr<InspectorValue>* result);

private:
    InspectorDebuggerAgent(InspectorAgent*, InspectorFrontend*, bool eraseStickyBreakpoints);

    PassRefPtr<InspectorValue> currentCallFrames();

    virtual void didParseSource(const String& sourceID, const String& url, const String& data, int lineOffset, int columnOffset, ScriptWorldType);
    virtual void failedToParseSource(const String& url, const String& data, int firstLine, int errorLine, const String& errorMessage);
    virtual void didPause(ScriptState*);
    virtual void didContinue();

    bool resolveBreakpoint(const String& breakpointId, const String& sourceId, const ScriptBreakpoint&, int* actualLineNumber, int* actualColumnNumber);

    class Script {
    public:
        Script()
            : lineOffset(0)
            , columnOffset(0)
            , linesCount(0)
        {
        }

        Script(const String& url, const String& data, int lineOffset, int columnOffset)
            : url(url)
            , data(data)
            , lineOffset(lineOffset)
            , columnOffset(columnOffset)
            , linesCount(0)
        {
        }

        String url;
        String data;
        int lineOffset;
        int columnOffset;
        int linesCount;
    };

    typedef HashMap<String, Script> ScriptsMap;
    typedef HashMap<String, Vector<String> > BreakpointIdToDebugServerBreakpointIdsMap;

    InspectorAgent* m_inspectorAgent;
    InspectorFrontend* m_frontend;
    ScriptState* m_pausedScriptState;
    ScriptsMap m_scripts;
    BreakpointIdToDebugServerBreakpointIdsMap m_breakpointIdToDebugServerBreakpointIds;
    String m_continueToLocationBreakpointId;
    RefPtr<InspectorObject> m_breakProgramDetails;
    bool m_javaScriptPauseScheduled;
};

} // namespace WebCore

#endif // ENABLE(JAVASCRIPT_DEBUGGER) && ENABLE(INSPECTOR)

#endif // !defined(InspectorDebuggerAgent_h)
