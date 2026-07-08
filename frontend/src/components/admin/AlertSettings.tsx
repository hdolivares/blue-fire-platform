'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BoltIcon, SignalIcon, LinkIcon, CurrencyDollarIcon, LockClosedIcon, WrenchScrewdriverIcon, ComputerDesktopIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: 'SYSTEM' | 'PERFORMANCE' | 'SECURITY' | 'MAINTENANCE' | 'INVESTMENT' | 'BLOCKCHAIN' | 'IOT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  conditions: AlertCondition[];
  isActive: boolean;
  createdAt: Date;
}

interface AlertCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: string;
}

interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  type: AlertRule['type'];
  severity: AlertRule['severity'];
  conditions: AlertCondition[];
}

const ALERT_TEMPLATES: AlertTemplate[] = [
  {
    id: 'performance-drop',
    name: 'Performance Drop Alert',
    description: 'Triggers when project efficiency drops below threshold',
    type: 'PERFORMANCE',
    severity: 'MEDIUM',
    conditions: [
      { field: 'efficiency', operator: 'less_than', value: '70' }
    ]
  },
  {
    id: 'sensor-offline',
    name: 'Sensor Offline Alert',
    description: 'Triggers when IoT sensors go offline',
    type: 'IOT',
    severity: 'HIGH',
    conditions: [
      { field: 'sensor_status', operator: 'equals', value: 'offline' }
    ]
  },
  {
    id: 'funding-milestone',
    name: 'Funding Milestone Alert',
    description: 'Triggers when project reaches funding milestones',
    type: 'INVESTMENT',
    severity: 'LOW',
    conditions: [
      { field: 'funding_percentage', operator: 'greater_than', value: '90' }
    ]
  },
  {
    id: 'blockchain-connection',
    name: 'Blockchain Connection Alert',
    description: 'Triggers when blockchain connection is lost',
    type: 'BLOCKCHAIN',
    severity: 'CRITICAL',
    conditions: [
      { field: 'connection_status', operator: 'equals', value: 'disconnected' }
    ]
  },
  {
    id: 'maintenance-due',
    name: 'Maintenance Due Alert',
    description: 'Triggers when equipment maintenance is due',
    type: 'MAINTENANCE',
    severity: 'MEDIUM',
    conditions: [
      { field: 'days_since_maintenance', operator: 'greater_than', value: '30' }
    ]
  },
  {
    id: 'security-breach',
    name: 'Security Breach Alert',
    description: 'Triggers on suspicious security activities',
    type: 'SECURITY',
    severity: 'CRITICAL',
    conditions: [
      { field: 'failed_login_attempts', operator: 'greater_than', value: '5' }
    ]
  }
];

const AlertSettings: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [, setEditingRule] = useState<AlertRule | null>(null);

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    type: 'PERFORMANCE' as AlertRule['type'],
    severity: 'MEDIUM' as AlertRule['severity'],
    conditions: [{ field: '', operator: 'equals' as AlertCondition['operator'], value: '' }],
    isActive: true,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await axios.get('/alerts/rules');
      setRules(response.data);
    } catch (err) {
      setError('Failed to load alert rules');
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRule = async () => {
    try {
      await axios.post('/alerts/rules', newRule);
      setShowCreateForm(false);
      setNewRule({
        name: '',
        description: '',
        type: 'PERFORMANCE',
        severity: 'MEDIUM',
        conditions: [{ field: '', operator: 'equals', value: '' }],
        isActive: true,
      });
      fetchRules();
    } catch (err) {
      console.error('Error creating rule:', err);
    }
  };

  const createRuleFromTemplate = (template: AlertTemplate) => {
    setNewRule({
      name: template.name,
      description: template.description,
      type: template.type,
      severity: template.severity,
      conditions: template.conditions,
      isActive: true,
    });
    setShowTemplates(false);
    setShowCreateForm(true);
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      // In a real implementation, you would update the rule
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, isActive } : rule
      ));
    } catch (err) {
      console.error('Error updating rule:', err);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      // In a real implementation, you would delete the rule
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  const addCondition = () => {
    setNewRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: '', operator: 'equals', value: '' }],
    }));
  };

  const removeCondition = (index: number) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const updateCondition = (index: number, field: keyof AlertCondition, value: unknown) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition
      ),
    }));
  };

  const getTypeIcon = (type: AlertRule['type']) => {
    const cls = 'h-5 w-5';
    switch (type) {
      case 'PERFORMANCE': return <BoltIcon className={cls} />;
      case 'IOT': return <SignalIcon className={cls} />;
      case 'BLOCKCHAIN': return <LinkIcon className={cls} />;
      case 'INVESTMENT': return <CurrencyDollarIcon className={cls} />;
      case 'SECURITY': return <LockClosedIcon className={cls} />;
      case 'MAINTENANCE': return <WrenchScrewdriverIcon className={cls} />;
      case 'SYSTEM': return <ComputerDesktopIcon className={cls} />;
      default: return <MegaphoneIcon className={cls} />;
    }
  };

  const getSeverityColor = (severity: AlertRule['severity']) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-danger';
      case 'HIGH': return 'bg-accent';
      case 'MEDIUM': return 'bg-warning';
      case 'LOW': return 'bg-brand-primary';
      default: return 'bg-text-muted';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--danger-bg)] border border-border rounded-lg p-4">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="gradient" className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-on-brand">Alert Settings</h2>
            <p className="text-on-brand/80">Configure automated alert rules and conditions</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowTemplates(true)}
              className="bg-on-brand/20 hover:bg-on-brand/30 text-on-brand border-on-brand/30"
            >
              Templates
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create New Rule
            </Button>
          </div>
        </div>
      </Card>

      {/* Rules List */}
      <Card variant="frosted" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Alert Rules</h3>
        </div>
        <div className="divide-y divide-border">
          {rules.length === 0 ? (
            <div className="px-6 py-8 text-center text-text-secondary">
              <svg className="mx-auto h-12 w-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-text-primary">No alert rules configured</p>
              <p className="text-xs text-text-secondary">Create your first alert rule to get started</p>
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(rule.severity)}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-text-secondary">{getTypeIcon(rule.type)}</span>
                        <h4 className="text-sm font-medium text-text-primary">{rule.name}</h4>
                        <Badge variant={rule.severity === 'CRITICAL' ? 'error' : rule.severity === 'HIGH' ? 'warning' : 'info'}>
                          {rule.severity}
                        </Badge>
                        <Badge variant={rule.isActive ? 'success' : 'pending'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{rule.description}</p>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-text-secondary">Conditions:</p>
                        <div className="mt-1 space-y-1">
                          {rule.conditions.map((condition, index) => (
                            <div key={index} className="text-xs text-text-secondary">
                              {condition.field} {condition.operator} {String(condition.value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={rule.isActive ? 'error' : 'success'}
                      onClick={() => toggleRuleStatus(rule.id, !rule.isActive)}
                    >
                      {rule.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingRule(rule)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="error"
                      onClick={() => deleteRule(rule.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card variant="frosted" className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Alert Templates</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(false)}
                  className="text-text-primary border-border"
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-text-secondary mb-4">Choose a template to quickly create common alert rules:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ALERT_TEMPLATES.map((template) => (
                  <Card key={template.id} variant="default" className="p-4 hover:border-border transition-colors">
                    <div className="flex items-start space-x-3">
                      <span className="text-brand-primary">{getTypeIcon(template.type)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary mb-1">{template.name}</h4>
                        <p className="text-sm text-text-secondary mb-2">{template.description}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={template.severity === 'CRITICAL' ? 'error' : template.severity === 'HIGH' ? 'warning' : 'info'}>
                            {template.severity}
                          </Badge>
                          <Badge variant="info">{template.type}</Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => createRuleFromTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Rule Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card variant="frosted" className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Create Alert Rule</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="text-text-primary border-border"
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Enter rule name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  rows={3}
                  placeholder="Enter rule description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as AlertRule['type'] })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    <option value="PERFORMANCE">Performance</option>
                    <option value="IOT">IoT</option>
                    <option value="BLOCKCHAIN">Blockchain</option>
                    <option value="INVESTMENT">Investment</option>
                    <option value="SECURITY">Security</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="SYSTEM">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Severity</label>
                  <select
                    value={newRule.severity}
                    onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as AlertRule['severity'] })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Conditions</label>
                <div className="space-y-2">
                  {newRule.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={condition.field}
                        onChange={(e) => updateCondition(index, 'field', e.target.value)}
                        className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        placeholder="Field name"
                      />
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, 'operator', e.target.value as AlertCondition['operator'])}
                        className="bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="contains">Contains</option>
                        <option value="not_contains">Not Contains</option>
                      </select>
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        placeholder="Value"
                      />
                      {newRule.conditions.length > 1 && (
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() => removeCondition(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCondition}
                    className="text-brand-primary border-brand-primary/30 hover:bg-brand-primary/10"
                  >
                    + Add Condition
                  </Button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border">
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="text-text-primary border-border"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={createRule}
                >
                  Create Rule
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AlertSettings; 