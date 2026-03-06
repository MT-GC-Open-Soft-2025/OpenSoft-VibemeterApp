/**
 * WellBee – useAdminData hook
 * Extracts agent CRUD and healthcheck logic from AdminPage.jsx.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  createAgent,
  getAgentHistory,
  getAgentsAdmin,
  runAgentHealthcheck,
  updateAgent,
} from '../api/admin';

const EMPTY_AGENT_FORM = {
  display_name: '',
  slug: '',
  description: '',
  persona_key: 'anchor',
  greeting_style: '',
  avatar_key: 'default',
  theme_key: 'default',
  base_url: '',
  public_base_url: '',
  status: 'active',
};

export function useAdminData(active) {
  const [agents, setAgents] = useState([]);
  const [agentHistory, setAgentHistory] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [agentForm, setAgentForm] = useState(EMPTY_AGENT_FORM);
  const [editingAgentId, setEditingAgentId] = useState(null);
  const [agentMessage, setAgentMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAgentsAdmin();
      setAgents(res.agents || []);
    } catch {
      setAgentMessage('Failed to load agents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) loadAgents();
  }, [active, loadAgents]);

  const openEditAgent = async (agent) => {
    setEditingAgentId(agent.agent_id);
    setSelectedAgentId(agent.agent_id);
    setAgentForm({
      display_name: agent.display_name,
      slug: agent.slug,
      description: agent.description,
      persona_key: agent.persona_key,
      greeting_style: agent.greeting_style,
      avatar_key: agent.avatar_key,
      theme_key: agent.theme_key,
      base_url: agent.base_url,
      public_base_url: agent.public_base_url,
      status: agent.status,
    });
    try {
      const res = await getAgentHistory(agent.agent_id);
      setAgentHistory(res.history || []);
    } catch {
      setAgentHistory([]);
    }
  };

  const resetForm = () => {
    setEditingAgentId(null);
    setSelectedAgentId(null);
    setAgentHistory([]);
    setAgentForm(EMPTY_AGENT_FORM);
  };

  const submitAgentForm = async () => {
    setAgentMessage('');
    try {
      if (editingAgentId) {
        await updateAgent(editingAgentId, agentForm);
        setAgentMessage('Agent updated successfully.');
      } else {
        await createAgent(agentForm);
        setAgentMessage('Agent created successfully.');
      }
      setAgentForm(EMPTY_AGENT_FORM);
      setEditingAgentId(null);
      await loadAgents();
    } catch (error) {
      setAgentMessage(error?.response?.data?.detail || 'Unable to save agent.');
    }
  };

  const triggerHealthcheck = async (agentId) => {
    try {
      await runAgentHealthcheck(agentId);
      setAgentMessage('Healthcheck completed.');
      await loadAgents();
      if (selectedAgentId === agentId) {
        const res = await getAgentHistory(agentId);
        setAgentHistory(res.history || []);
      }
    } catch {
      setAgentMessage('Healthcheck failed.');
    }
  };

  const updateField = (key, value) =>
    setAgentForm((prev) => ({ ...prev, [key]: value }));

  return {
    agents,
    agentHistory,
    selectedAgentId,
    agentForm,
    editingAgentId,
    agentMessage,
    loading,
    openEditAgent,
    resetForm,
    submitAgentForm,
    triggerHealthcheck,
    updateField,
    EMPTY_AGENT_FORM,
  };
}
