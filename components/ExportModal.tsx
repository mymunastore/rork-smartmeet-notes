import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { Download, FileText, Code, X, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useNotes } from '@/hooks/use-notes-store';
import { Note } from '@/types/note';

interface ExportModalProps {
  visible: boolean;
  note: Note;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ visible, note, onClose }) => {
  const { exportNote } = useNotes();
  const [selectedFormat, setSelectedFormat] = useState<'txt' | 'json'>('txt');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const exportFormats = [
    {
      id: 'txt' as const,
      name: 'Text File',
      description: 'Human-readable format with transcript and summary',
      icon: FileText,
      extension: '.txt',
    },
    {
      id: 'json' as const,
      name: 'JSON File',
      description: 'Complete data export including metadata',
      icon: Code,
      extension: '.json',
    },
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const content = await exportNote(note.id, { format: selectedFormat });
      const fileName = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}${exportFormats.find(f => f.id === selectedFormat)?.extension}`;
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([content], { 
          type: selectedFormat === 'json' ? 'application/json' : 'text/plain' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert('Export Successful', `${fileName} has been downloaded.`);
      } else {
        // For mobile, use Share API
        await Share.share({
          message: content,
          title: fileName,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Unable to export the note. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickShare = async () => {
    try {
      const content = await exportNote(note.id, { format: 'txt' });
      
      if (Platform.OS === 'web') {
        // For web, copy to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(content);
          Alert.alert('Copied', 'Note content copied to clipboard.');
        } else {
          Alert.alert('Share', 'Please use the export button to download the file.');
        }
      } else {
        await Share.share({
          message: content,
          title: note.title,
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Share Failed', 'Unable to share the note.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📤 Export Note</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.light.gray[600]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <View style={styles.noteInfo}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <Text style={styles.noteDetails}>
              {new Date(note.createdAt).toLocaleDateString()} • {Math.floor(note.duration / 60)}:{(note.duration % 60).toString().padStart(2, '0')}
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📁 Export Format</Text>
            <View style={styles.formatOptions}>
              {exportFormats.map((format) => {
                const IconComponent = format.icon;
                const isSelected = selectedFormat === format.id;
                
                return (
                  <TouchableOpacity
                    key={format.id}
                    style={[styles.formatOption, isSelected && styles.formatOptionSelected]}
                    onPress={() => setSelectedFormat(format.id)}
                  >
                    <View style={styles.formatOptionContent}>
                      <View style={styles.formatIconContainer}>
                        <IconComponent 
                          size={24} 
                          color={isSelected ? '#fff' : Colors.light.gray[600]} 
                        />
                      </View>
                      <View style={styles.formatInfo}>
                        <Text style={[styles.formatName, isSelected && styles.formatNameSelected]}>
                          {format.name}
                        </Text>
                        <Text style={[styles.formatDescription, isSelected && styles.formatDescriptionSelected]}>
                          {format.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkIcon}>
                          <Check size={20} color="#fff" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 What's Included</Text>
            <View style={styles.includedItems}>
              <View style={styles.includedItem}>
                <Text style={styles.includedItemIcon}>✅</Text>
                <Text style={styles.includedItemText}>Note title and metadata</Text>
              </View>
              <View style={styles.includedItem}>
                <Text style={styles.includedItemIcon}>✅</Text>
                <Text style={styles.includedItemText}>Full transcript</Text>
              </View>
              <View style={styles.includedItem}>
                <Text style={styles.includedItemIcon}>✅</Text>
                <Text style={styles.includedItemText}>AI-generated summary</Text>
              </View>
              {note.actionItems && note.actionItems.length > 0 && (
                <View style={styles.includedItem}>
                  <Text style={styles.includedItemIcon}>✅</Text>
                  <Text style={styles.includedItemText}>Action items</Text>
                </View>
              )}
              {note.tags.length > 0 && (
                <View style={styles.includedItem}>
                  <Text style={styles.includedItemIcon}>✅</Text>
                  <Text style={styles.includedItemText}>Tags and labels</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.quickShareButton} 
            onPress={handleQuickShare}
            disabled={isExporting}
          >
            <Text style={styles.quickShareText}>
              {Platform.OS === 'web' ? '📋 Copy' : '📤 Quick Share'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.exportButton, isExporting && styles.exportButtonDisabled]} 
            onPress={handleExport}
            disabled={isExporting}
          >
            <Download size={20} color="#fff" style={styles.exportIcon} />
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : 'Export'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  noteInfo: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  noteDetails: {
    fontSize: 14,
    color: Colors.light.gray[600],
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  formatOptions: {
    gap: 12,
  },
  formatOption: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  formatOptionSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  formatOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  formatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.nature.sky,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  formatInfo: {
    flex: 1,
  },
  formatName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  formatNameSelected: {
    color: '#fff',
  },
  formatDescription: {
    fontSize: 14,
    color: Colors.light.gray[600],
    lineHeight: 20,
  },
  formatDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkIcon: {
    marginLeft: 12,
  },
  includedItems: {
    gap: 8,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  includedItemIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  includedItemText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  quickShareButton: {
    flex: 1,
    backgroundColor: Colors.light.nature.sky,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickShareText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  exportButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportIcon: {
    marginRight: 4,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ExportModal;