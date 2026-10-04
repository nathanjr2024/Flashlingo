/**
 * Words List Screen - FlashLingo
 * Searchable, filterable list of all words with delete confirmation.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../presentation/theme';
import { WordRepository } from '../../data/repositories/wordRepository';
import { audioService } from '../../data/services/audioService';
import type { Word } from '../../domain/srs/types';
import { SRS_LABELS } from '../../domain/srs/types';

type FilterType = 'all' | 'due' | 'new' | 'learned';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'due', label: 'Revisar Hoje' },
  { key: 'new', label: 'Novas' },
  { key: 'learned', label: 'Aprendidas' },
];

export default function WordsScreen() {
  const [words, setWords] = useState<Word[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null);
  const [todayStr] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  const wordRepo = new WordRepository();

  const loadWords = useCallback(() => {
    let filtered: Word[];
    if (searchQuery.trim()) {
      filtered = wordRepo.search(searchQuery.trim());
    } else {
      switch (activeFilter) {
        case 'due':
          filtered = wordRepo.getDue(todayStr);
          break;
        case 'new':
          filtered = wordRepo.getNew();
          break;
        case 'learned':
          filtered = wordRepo.getLearned();
          break;
        default:
          filtered = wordRepo.getAll();
      }
    }
    setWords(filtered);
  }, [searchQuery, activeFilter, todayStr, wordRepo]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    wordRepo.delete(deleteTarget.id);
    setDeleteTarget(null);
    loadWords();
  }, [deleteTarget, wordRepo, loadWords]);

  const handlePlayAudio = async (word: string) => {
    await audioService.playPronunciation(word);
  };

  const isDue = (w: Word) => !w.nextReview || w.nextReview <= todayStr;
  const isNew = (w: Word) => !w.lastReview;

  const totalCount = wordRepo.count();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{'\u{1F4D6}'} Minhas Palavras</Text>
        <Text style={styles.subtitle}>{totalCount} palavras</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons
          name="search"
          size={18}
          color={Colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar palavra..."
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Buscar palavra"
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[
              styles.filterChip,
              activeFilter === f.key && styles.filterChipActive,
            ]}
            onPress={() => {
              setActiveFilter(f.key);
              setSearchQuery('');
            }}
            accessible
            accessibilityRole="button"
            accessibilityState={{ selected: activeFilter === f.key }}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === f.key && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Word List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {words.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{'\u{1F4ED}'}</Text>
            <Text style={styles.emptyTitle}>Nenhuma palavra aqui</Text>
            <Text style={styles.emptySubtitle}>
              Tente mudar o filtro ou adicione novas palavras.
            </Text>
          </View>
        ) : (
          words.map((w) => {
            const due = isDue(w);
            const newWord = isNew(w);
            const statusLabel = newWord
              ? 'Nova'
              : due
              ? 'Revisar'
              : SRS_LABELS[w.level] || `Lv${w.level}`;
            const statusColor = newWord
              ? Colors.success
              : due
              ? Colors.danger
              : Colors.primary;
            const statusBg = newWord ? '#d1fae5' : due ? '#fee2e2' : '#e0e7ff';
            const nextTxt = w.nextReview
              ? `Próxima: ${w.nextReview}`
              : 'Nunca estudada';

            return (
              <View key={w.id} style={styles.wordItem}>
                <View style={styles.wordLeft}>
                  <View style={styles.wordTopRow}>
                    <Text style={styles.wordText}>{w.word}</Text>
                    <Pressable
                      onPress={() => handlePlayAudio(w.word)}
                      style={styles.wordAudioBtn}
                      accessible
                      accessibilityLabel={`Ouvir pronúncia de ${w.word}`}
                    >
                      <Ionicons
                        name="volume-high"
                        size={16}
                        color={Colors.primary}
                      />
                    </Pressable>
                  </View>
                  <Text style={styles.wordTrans}>{w.translation}</Text>
                  <View style={styles.wordMeta}>
                    <View
                      style={[styles.wiTag, { backgroundColor: statusBg }]}
                    >
                      <Text
                        style={[styles.wiTagText, { color: statusColor }]}
                      >
                        {statusLabel}
                      </Text>
                    </View>
                    <View
                      style={[styles.wiTag, { backgroundColor: '#e0e7ff' }]}
                    >
                      <Text
                        style={[styles.wiTagText, { color: Colors.primary }]}
                      >
                        {w.tag}
                      </Text>
                    </View>
                    <Text style={styles.wiInterval}>{nextTxt}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => setDeleteTarget(w)}
                  style={styles.deleteBtn}
                  accessible
                  accessibilityLabel={`Excluir ${w.word}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={Colors.textMuted}
                  />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {'\u{1F5D1}️'} Excluir Palavra
            </Text>
            <Text style={styles.modalText}>
              Tem certeza que deseja excluir "{deleteTarget?.word}"? Todo o
              progresso SRS será perdido.
            </Text>
            <Pressable style={styles.dangerBtn} onPress={handleDelete}>
              <Text style={styles.dangerBtnText}>Sim, excluir</Text>
            </Pressable>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => setDeleteTarget(null)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extraBold,
    color: Colors.primary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  filterRow: {
    marginBottom: Spacing.md,
  },
  filterContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  wordLeft: {
    flex: 1,
  },
  wordTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  wordText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  wordAudioBtn: {
    padding: 2,
  },
  wordTrans: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  wordMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs + 2,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  wiTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  wiTagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  wiInterval: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  deleteBtn: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: Radius.xl + 4,
    borderTopRightRadius: Radius.xl + 4,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl + Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.extraBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  modalText: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  dangerBtn: {
    backgroundColor: Colors.danger,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dangerBtnText: {
    color: '#ffffff',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
  cancelBtn: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
});