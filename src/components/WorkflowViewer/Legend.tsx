import React from 'react';
import { Panel } from 'reactflow';
import {
  Globe,
  Mail,
  Webhook,
  MessageSquare,
  Settings,
  Code,
  Zap,
  AlertCircle,
  Database,
} from 'lucide-react';

export function Legend() {
  return (
    <Panel position="top-left" className="workflow-panel">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Task Types</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-workflow-blue/20">
                <Globe className="w-4 h-4 text-workflow-blue" />
              </div>
              <span className="text-sm text-foreground">API Call</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-workflow-purple/20">
                <Mail className="w-4 h-4 text-workflow-purple" />
              </div>
              <span className="text-sm text-foreground">Email Task</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-workflow-green/20">
                <Webhook className="w-4 h-4 text-workflow-green" />
              </div>
              <span className="text-sm text-foreground">Webhook</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-workflow-pink/20">
                <MessageSquare className="w-4 h-4 text-workflow-pink" />
              </div>
              <span className="text-sm text-foreground">Message/Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-muted/20">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-foreground">Other Action</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Indicators</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-workflow-purple" />
              <span className="text-sm text-foreground">Jinja Templates</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-workflow-orange" />
              <span className="text-sm text-foreground">Has Retry Config</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-workflow-yellow" />
              <span className="text-sm text-foreground">Mock Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-workflow-purple" />
              <span className="text-sm text-foreground">Custom Organization</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Transitions</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-workflow-green" />
              <span className="text-sm text-foreground">Follow All</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-workflow-blue" />
              <span className="text-sm text-foreground">Follow First</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}