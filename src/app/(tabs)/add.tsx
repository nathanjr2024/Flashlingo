/**
 * Add Word Screen - FlashLingo
 * Form for adding new words to the deck with auto-fetch pronunciation.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../presentation/theme';
import { WordRepository } from '../../data/repositories/wordRepository';
import { audioService } from '../../data/services/audioService';
import { createWord } from '../../domain/srs/algorithm';

const TAGS = [
  'Geral',
  'Trabalho',
  'Viagem',
  'Tecnologia',
  'Phrasal Verbs',
  'Idioms',
  'Formalidades',
  'Coloquial',
];

const POS_OPTIONS = [
  { value: 'noun', label: 'Substantivo (noun)' },
  { value: 'verb', label: 'Verbo (verb)' },
  { value: 'adjective', label: 'Adjetivo (adjective)' },
  { value: 'adverb', label: 'Advérbio (adverb)' },
  { value: 'phrase', label: 'Expressão / Frase' },
  { value: 'other', label: 'Outro' },
];

export default function AddScreen() {
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [translation, setTranslation] = useState('');
  const [pos, setPos] = useState('noun');
  const [example, setExample] = useState('');
  const [examplePt, setExamplePt] = useState('');
  const [selectedTag, setSelectedTag] = useState('Geral');
  const [isSaving, setIsSaving] = useState(false);
  const [showPosPicker, setShowPosPicker] = useState(false);

  const wordRepo = new WordRepository();

  const handleSave = useCallback(async () => {
    const trimmedWord = word.trim();
    const trimmedTrans = translation.trim();

    if (!trimmedWord || !trimmedTrans) {
      Alert.alert('Campos obrigatórios', 'Preencha a palavra e a tradução.');
      return;
    }

    if (wordRepo.exists(trimmedWord)) {
      Alert.alert('Palavra duplicada', `"${trimmedWord}" já existe no deck.`);
      return;
    }

    setIsSaving(true);

    try {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const newWord = createWord(id, {
        word: trimmedWord,
        translation: trimmedTrans,
        phonetic: phonetic.trim(),
        pos,
        example: example.trim(),
        examplePt: examplePt.trim(),
        tag: selectedTag,
        createdAt: now,
      });

      wordRepo.insert(newWord);

      // Pre-fetch audio in background
      audioService.preFetch(trimmedWord).catch(() => {});

      // Auto-fetch phonetic if not provided
      if (!phonetic.trim()) {
        audioService
          .fetchPhonetic(trimmedWord)
          .then((ipa) => {
            if (ipa) {
              const updated = { ...newWord, phonetic: ipa };
              wordRepo.update(updated);
            }
          })
          .catch(() => {});
      }

      // Clear form
      setWord('');
      setPhonetic('');
      setTranslation('');
      setPos('noun');
      setExample('');
      setExamplePt('');
      setSelectedTag('Geral');

      Alert.alert('Sucesso', `"${trimmedWord}" foi adicionada ao deck!`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a palavra. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }, [word, translation, phonetic, pos, example, examplePt, selectedTag, wordRepo]);

  const handlePlayAudio = async () => {
    const trimmedWord = word.trim();
    if (trimmedWord) {
      await audioService.playPronunciation(trimmedWord);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{'➕'} Nova Palavra</Text>
          <Text style={styles.subtitle}>Adicione ao seu deck</Text>
        </View>

        {/* Word Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>PALAVRA EM INGLÊS *</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={word}
              onChangeText={setWord}
              placeholder="Ex: serendipity"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Palavra em inglês"
            />
            {word.trim() && (
              <Pressable onPress={handlePlayAudio} style={styles.audioBtn}>
                <Ionicons name="volume-high" size={20} color={Colors.primary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Phonetic Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>PRONÚNCIA (OPCIONAL)</Text>
          <TextInput
            style={styles.input}
            value={phonetic}
            onChangeText={setPhonetic}
            placeholder="Ex: /ˌserəndɪpɪti/"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            accessibilityLabel="Pronúncia fonética"
          />
        </View>

        {/* Translation Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>TRADUÇÃO *</Text>
          <TextInput
            style={styles.input}
            value={translation}
            onChangeText={setTranslation}
            placeholder="Ex: serendipidade, acaso feliz"
            placeholderTextColor={Colors.textMuted}
            accessibilityLabel="Tradução em português"
          />
        </View>

        {/* Part of Speech */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>CLASSE GRAMATICAL</Text>
          <Pressable
            style={styles.selectInput}
            onPress={() => setShowPosPicker(!showPosPicker)}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Classe gramatical: ${POS_OPTIONS.find((o) => o.value === pos)?.label}`}
          >
            <Text style={styles.selectText}>
              {POS_OPTIONS.find((o) => o.value === pos)?.label}
            </Text>
            <Ionicons
              name={showPosPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.textMuted}
            />
          </Pressable>
          {showPosPicker && (
            <View style={styles.pickerDropdown}>
              {POS_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.pickerOption,
                    pos === option.value && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setPos(option.value);
                    setShowPosPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      pos === option.value && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Example EN */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>EXEMPLO EM INGLÊS (OPCIONAL)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={example}
            onChangeText={setExample}
            placeholder="Ex: It was pure serendipity that we met."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            accessibilityLabel="Exemplo em inglês"
          />
        </View>

        {/* Example PT */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>TRADUÇÃO DO EXEMPLO (OPCIONAL)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={examplePt}
            onChangeText={setExamplePt}
            placeholder="Ex: Foi pura serendipidade que nos encontramos."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            accessibilityLabel="Tradução do exemplo"
          />
        </View>

        {/* Tags */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>CATEGORIA / TAG</Text>
          <View style={styles.tagWrap}>
            {TAGS.map((tag) => (
              <Pressable
                key={tag}
                style={[
                  styles.tag,
                  selectedTag === tag && styles.tagSelected,
                ]}
                onPress={() => setSelectedTag(tag)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Tag: ${tag}`}
                accessibilityState={{ selected: selectedTag === tag }}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTag === tag && styles.tagTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Salvar palavra"
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? 'Salvando...' : '\u{1F4BE} Salvar Palavra'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
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
  formGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    marginBottom: Spacing.xs + 2,
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  audioBtn: {
    padding: Spacing.sm,
  },
  textArea: {
    height: 80,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  selectText: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  pickerDropdown: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pickerOption: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: '#e0e7ff',
  },
  pickerOptionText: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  pickerOptionTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  tagSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  tagTextSelected: {
    color: '#ffffff',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
});