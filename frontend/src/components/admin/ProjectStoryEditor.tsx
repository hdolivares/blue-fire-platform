'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StyledTextarea } from '@/components/StyledInput';

type Story = { summary: string; opportunity: string; community: string };

interface Props {
  projectId: string;
  initial: Partial<Story>;
  onSaved?: () => void;
}

/** Admin editor for the investor-facing "About this project" text. */
export const ProjectStoryEditor = ({ projectId, initial, onSaved }: Props) => {
  const [story, setStory] = useState<Story>({ summary: '', opportunity: '', community: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStory({
      summary: initial.summary ?? '',
      opportunity: initial.opportunity ?? '',
      community: initial.community ?? '',
    });
  }, [initial.summary, initial.opportunity, initial.community]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStory((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/projects/${projectId}/story`, story);
      toast.success('Project story saved');
      onSaved?.();
    } catch (error) {
      console.error('Failed to save project story:', error);
      toast.error('Failed to save project story');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="default" className="p-6">
      <h2 className="section-header">Project story</h2>
      <p className="text-sm text-secondary mb-4">
        Shown to investors in &ldquo;About this project&rdquo; and on the project card.
      </p>
      <div className="space-y-4">
        <div>
          <label htmlFor="story-summary" className="block text-sm font-medium mb-1">Summary</label>
          <StyledTextarea
            id="story-summary"
            name="summary"
            rows={2}
            maxLength={300}
            value={story.summary}
            onChange={handleChange}
            placeholder="One or two sentences shown on the project card."
          />
        </div>
        <div>
          <label htmlFor="story-opportunity" className="block text-sm font-medium mb-1">The idea</label>
          <StyledTextarea
            id="story-opportunity"
            name="opportunity"
            rows={6}
            maxLength={3000}
            value={story.opportunity}
            onChange={handleChange}
            placeholder="Why this site, what water and energy problem the machine solves."
          />
        </div>
        <div>
          <label htmlFor="story-community" className="block text-sm font-medium mb-1">Community &amp; impact</label>
          <StyledTextarea
            id="story-community"
            name="community"
            rows={6}
            maxLength={3000}
            value={story.community}
            onChange={handleChange}
            placeholder="Who benefits locally and how."
          />
        </div>
        <Button onClick={handleSave} disabled={saving} variant="primary">
          {saving ? 'Saving...' : 'Save story'}
        </Button>
      </div>
    </Card>
  );
};
